import {EventBus, markup, toRaw} from "@odoo/owl";
import {Chatter} from "@mail/chatter/web_portal/chatter";
import {SIGNATURE_CLASS} from "@html_editor/main/signature_plugin";
import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";
import {childNodes} from "@html_editor/utils/dom_traversal";
import {parseHTML} from "@html_editor/utils/html";
import {patch} from "@web/core/utils/patch";
import {prettifyMessageContent} from "@mail/utils/common/format";
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
            if (!this.state.thread.id) {
                this.props.saveRecord?.();
            }
            this.openFullComposer();
            return;
        }
        return super.toggleComposer(...arguments);
    },
    // A rough composer function copy of `onClickFullComposer`
    async openFullComposer() {
        const newPartners = this.state.thread.suggestedRecipients.filter(
            (recipient) => recipient.checked && !recipient.persona
        );
        if (newPartners.length) {
            const recipientEmails = [];
            const recipientAdditionalValues = {};
            newPartners.forEach((recipient) => {
                recipientEmails.push(recipient.email);
                recipientAdditionalValues[recipient.email] =
                    recipient.create_values || {};
            });
            const partners = await rpc("/mail/partner/from_email", {
                emails: recipientEmails,
                additional_values: recipientAdditionalValues,
            });
            for (const index in partners) {
                const partnerData = partners[index];
                const persona = this.store.Persona.insert({
                    ...partnerData,
                    type: "partner",
                });
                const email = recipientEmails[index];
                const recipient = this.state.thread.suggestedRecipients.find(
                    (rec) => rec.email === email
                );
                Object.assign(recipient, {persona});
            }
        }
        const body = this.state.thread.composer.text;
        const validMentions = this.store.getMentionsFromText(body, {
            mentionedChannels: this.state.thread.composer.mentionedChannels,
            mentionedPartners: this.state.thread.composer.mentionedPartners,
        });
        let default_body = await prettifyMessageContent(body, validMentions);
        if (!default_body) {
            const composer = toRaw(this.state.thread.composer);
            composer.emailAddSignature = true;
        }
        default_body = this.formatDefaultBodyForFullComposer(
            default_body,
            this.state.thread.composer.emailAddSignature
                ? markup(this.store.self.signature)
                : ""
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
                default_partner_ids: this.state.thread.suggestedRecipients
                    .filter((recipient) => recipient.checked)
                    .map((recipient) => recipient.persona.id),
                default_res_ids: [this.state.thread.id],
                default_subtype_xmlid: "mail.mt_comment",
                mail_post_autofollow: this.state.thread.hasWriteAccess,
            },
        };
        const options = {
            onClose: (...args) => {
                const accidentalDiscard = !args.length;
                const isDiscard = accidentalDiscard || args[0]?.special;
                if (!isDiscard && this.state.thread.model === "mail.box") {
                    this.notifySendFromMailbox();
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
                this.onCloseFullComposerCallback();
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
        const fragment = parseHTML(document, defaultBody);
        if (!fragment.firstChild) {
            fragment.append(document.createElement("BR"));
        }
        if (signature) {
            const signatureEl = renderToElement("html_editor.Signature", {
                signature,
                signatureClass: SIGNATURE_CLASS,
            });
            fragment.append(signatureEl);
        }
        const container = document.createElement("DIV");
        container.append(...childNodes(fragment));
        wrapInlinesInBlocks(container, {baseContainerNodeName: "DIV"});
        return container.innerHTML;
    },
    // Copied and modified methods from composer
    notifySendFromMailbox() {
        this.env.services.notification.add(
            _t('Message posted on "%s"', this.state.thread.displayName),
            {type: "info"}
        );
    },
    saveContent() {
        const composer = toRaw(this.state.thread.composer);
        const onSaveContent = (text, emailAddSignature) => {
            browser.localStorage.setItem(
                composer.localId,
                JSON.stringify({emailAddSignature, text})
            );
        };
        if (this.isFullComposerOpen) {
            this.fullComposerBus.trigger("SAVE_CONTENT", {onSaveContent});
        } else {
            onSaveContent(composer.text, true);
        }
    },
    restoreContent() {
        const composer = toRaw(this.state.thread.composer);
        try {
            const config = JSON.parse(browser.localStorage.getItem(composer.localId));
            if (config.text) {
                composer.emailAddSignature = config.emailAddSignature;
                composer.text = config.text;
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
