/* Copyright 2019-2021 Camptocamp SA
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define("web_send_message_popup/static/src/js/chatter.js", function (require) {
    "use strict";

    const components = {
        Composer: require("mail/static/src/components/chatter_topbar/chatter_topbar.js"),
    };
    const {patch} = require("web.utils");

    patch(components.Composer, "web_send_message_popup/static/src/js/chatter.js", {
        /**
         * Overwrite to always launch full composer instead of quick messages
         */
        _onClickSendMessage() {
            this._super.apply(this, arguments);
            if (
                this.chatter.composer &&
                this.chatter.isComposerVisible &&
                !this.chatter.composer.isLog
            ) {
                this.chatter.update({isComposerVisible: false});
                this.chatter.composer.openFullComposer();
            }
        },
    });
});
