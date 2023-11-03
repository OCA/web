/** @odoo-module **/

import {clear} from "@mail/model/model_field_command";
import {escapeAndCompactTextContent} from "@mail/js/utils";
import {registerPatch} from "@mail/model/model_core";

registerPatch({
    name: "Chatter",
    recordMethods: {
        // Fn overwrite
        onClickSendMessage() {
            if (this.composerView) {
                // Change `isLog` to false since this should only be possible when you
                // press "Log Note" first, otherwise this won't hurt.
                this.composerView.composer.update({isLog: false});
                // Open the full composer with `composerView` because it carries through
                // the composer options.
                this.composerView.openFullComposer();
                // Clear the `composerView` since we don't need it no more.
                this.update({composerView: clear()});
                return;
            }
            this.openFullComposer();
        },
        async openFullComposer() {
            // Rough copy of composer view function `openFullComposer`.
            // Get composer from thread.
            // We access data from the composer since history still is saved there.
            // e.g. open and close "Log note".
            const composer = this.thread.composer;
            const context = {
                default_attachment_ids: composer.attachments.map((att) => att.id),
                default_body: escapeAndCompactTextContent(composer.textInputContent),
                default_is_log: false,
                default_model: this.threadModel,
                default_partner_ids: composer.recipients.map((partner) => partner.id),
                default_res_id: this.threadId,
                mail_post_autofollow: this.thread.hasWriteAccess,
            };
            const action = {
                type: "ir.actions.act_window",
                name: this.env._t("Compose Email"),
                res_model: "mail.compose.message",
                view_mode: "form",
                views: [[false, "form"]],
                target: "new",
                context,
            };
            const options = {
                on_close: () => {
                    if (composer.exists()) {
                        composer._reset();
                        if (composer.activeThread) {
                            composer.activeThread.fetchData(["messages"]);
                        }
                    }
                },
            };
            await this.env.services.action.doAction(action, options);
        },
    },
});
