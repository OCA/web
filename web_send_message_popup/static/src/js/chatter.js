/** @odoo-module **/

import { insertAndReplace, clear } from '@mail/model/model_field_command';
import {
    registerInstancePatchModel,
} from "@mail/model/model_core";

registerInstancePatchModel(
    "mail.chatter",
    "mail/static/src/models/chatter/chatter.js",
    {
        /**
         * Handles click on "send message" button.
         *
         * @param {MouseEvent} ev
         */
        onClickSendMessage(ev) {
            if(!this.composerView) {
                this.update({ composerView: insertAndReplace() });
                this.composerView.composer.update({ isLog: false });
                this.composerView.openFullComposer();
                this.update({ composerView: clear() });
            }
        }
    }
);

