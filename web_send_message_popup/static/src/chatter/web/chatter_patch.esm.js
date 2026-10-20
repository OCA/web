import {EventBus, markup, toRaw} from "@odoo/owl";
import {
    createDocumentFragmentFromContent,
    isHtmlEmpty,
    isMarkup,
} from "@web/core/utils/html";
import {Chatter} from "@mail/chatter/web_portal/chatter";
// Core patches Chatter.prototype.toggleComposer in this file and does NOT call
// super, so whichever patch is applied last wins outright. Importing it here
// for its side effect guarantees core is patched before we are, which puts our
// override outermost. Without it the module is silently inert.
import "@mail/chatter/web/chatter_patch";
import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";
import {childNodes} from "@html_editor/utils/dom_traversal";
import {patch} from "@web/core/utils/patch";
import {renderToElement} from "@web/core/utils/render";
import {rpc} from "@web/core/network/rpc";
import {wrapInlinesInBlocks} from "@html_editor/utils/dom";

// There's another, more unorthodox, way to accomplish the same thing, but with less
// lines!
// You could patch the `Chatter` and `Composer`, where Chatter would pass a function to
// the Composer's props to expose its `onClickFullComposer` method in `setup`.
// Then Chatter would then mutate itself with another function to callback the
// `onClickFullComposer` function from Composer - utilizing the existing code from
// Composer even when it's not being rendered.
// Making it possible to call that new mutated-in function in Chatter's `toggleComposer`
// function.
// HOWEVER that's following some bad practices, callback functions are fine, what is not
// fine is children mutating parents (not exactly, but really that's what would be going
// on...)
// Keeping the code more simple and clear - functions copied over and adjusted from
// Composer

patch(Chatter.prototype, {
    setup() {
        super.setup(...arguments);
        this.fullComposerBus = new EventBus();
        this.isFullComposerOpen = false;
    },
    toggleComposer(mode = false) {
        if (mode === "message") {
            this.closeSearch();
            this.state.composerType = false;
            const open = async () => {
                await this.updateRecipients(this.props.record, mode);
                await this.openFullComposer();
            };
            if (this.state.thread.id) {
                open();
            } else {
                this.onThreadCreated = open;
                this.props.saveRecord?.();
            }
            return;
        }
        return super.toggleComposer(...arguments);
    },
    // A rough composer function copy of `onClickFullComposer`
    async openFullComposer() {
        const allRecipients = [
            ...(this.state.thread.suggestedRecipients || []),
            ...(this.state.thread.additionalRecipients || []),
        ];
        const newPartners = allRecipients.filter((recipient) => !recipient.partner_id);
        if (newPartners.length) {
            const recipientEmails = newPartners.map((recipient) => recipient.email);
            const partners = await rpc("/mail/partner/from_email", {
                thread_model: this.state.thread.model,
                thread_id: this.state.thread.id,
                emails: recipientEmails,
            });
            for (const index in partners) {
                const partnerData = partners[index];
                const partner = this.store["res.partner"].insert(partnerData);
                const email = recipientEmails[index];
                const recipient = allRecipients.find((rec) => rec.email === email);
                if (recipient) {
                    recipient.partner_id = partner.id;
                }
            }
        }
        let default_body = this.state.thread.composer.composerHtml;
        if (isHtmlEmpty(default_body)) {
            const composer = toRaw(this.state.thread.composer);
            composer.emailAddSignature = true;
        }
        const signature =
            this.state.thread.effectiveSelf?.main_user_id?.getSignatureBlock?.() || "";
        default_body = this.formatDefaultBodyForFullComposer(
            default_body,
            this.state.thread.composer.emailAddSignature ? signature : ""
        );
        const action = {
            name: _t("Compose Email"),
            type: "ir.actions.act_window",
            res_model: "mail.compose.message",
            view_mode: "form",
            views: [[false, "form"]],
            target: "new",
            context: {
                default_attachment_ids: this.state.thread.composer.attachments.map(
                    (attachment) => attachment.id
                ),
                default_body,
                default_email_add_signature: false,
                default_model: this.state.thread.model,
                default_partner_ids: allRecipients
                    .filter((recipient) => recipient.partner_id)
                    .map((recipient) => recipient.partner_id),
                default_res_ids: [this.state.thread.id],
                default_subtype_xmlid: "mail.mt_comment",
                clicked_on_full_composer: true,
                body_contains_signature_only:
                    !this.state.thread.composer.composerText ||
                    this.state.thread.composer.composerText.trim().length === 0,
                is_thread_composer: true,
            },
        };
        const options = {
            onClose: (args) => {
                const accidentalDiscard = args?.dismiss;
                const isDiscard = accidentalDiscard || args?.special;
                if (!isDiscard && this.state.thread.model === "mail.box") {
                    this.store.notifySendFromMailbox(this.state.thread.displayName);
                }
                if (accidentalDiscard) {
                    this.fullComposerBus.trigger("ACCIDENTAL_DISCARD", {
                        onAccidentalDiscard: (isEmpty) => {
                            if (!isEmpty) {
                                this.saveContent();
                                this.restoreContent();
                            }
                        },
                    });
                } else {
                    this.clear();
                }
                this.state.thread.composer.replyToMessage = undefined;
                this.onCloseFullComposerCallback(isDiscard);
                this.isFullComposerOpen = false;
                this.fullComposerBus = new EventBus();
            },
            props: {fullComposerBus: this.fullComposerBus},
        };
        await this.env.services.action.doAction(action, options);
        this.isFullComposerOpen = true;
    },
    // Method copied not from the composer file but the composer_patch one
    formatDefaultBodyForFullComposer(defaultBody, signature = "") {
        const fragment = createDocumentFragmentFromContent(defaultBody).body;
        if (!fragment.firstChild) {
            fragment.append(document.createElement("BR"));
        }
        if (signature) {
            const signatureEl = renderToElement("html_editor.Signature", {
                signature,
                signatureClass: "o-signature-container",
            });
            fragment.append(document.createElement("BR"));
            fragment.append(signatureEl);
        }
        const container = document.createElement("DIV");
        container.append(...childNodes(fragment));
        wrapInlinesInBlocks(container, {baseContainerNodeName: "DIV"});
        return markup(container.innerHTML);
    },
    // Copied and modified methods from composer
    saveContent() {
        const composer = toRaw(this.state.thread.composer);
        const onSaveContent = ({composerHtml, emailAddSignature}) => {
            if (isHtmlEmpty(composerHtml)) {
                browser.localStorage.removeItem(composer.localId);
            } else {
                browser.localStorage.setItem(
                    composer.localId,
                    JSON.stringify({
                        emailAddSignature,
                        composerHtml: isMarkup(composerHtml)
                            ? ["markup", composerHtml]
                            : composerHtml,
                    })
                );
            }
        };
        if (this.isFullComposerOpen) {
            this.fullComposerBus.trigger("SAVE_CONTENT", {onSaveContent});
        } else {
            onSaveContent({
                composerHtml: composer.composerHtml,
                emailAddSignature: true,
            });
        }
    },
    restoreContent() {
        const composer = toRaw(this.state.thread.composer);
        const raw = browser.localStorage.getItem(composer.localId);
        if (!raw) {
            return;
        }
        try {
            const config = JSON.parse(raw);
            if (config && !isHtmlEmpty(config.composerHtml)) {
                composer.emailAddSignature = config.emailAddSignature;
                composer.composerHtml = config.composerHtml;
            }
        } catch {
            browser.localStorage.removeItem(composer.localId);
        }
    },
    clear() {
        this.state.thread.composer.clear();
        browser.localStorage.removeItem(this.state.thread.composer.localId);
    },
});
