/* Copyright 2019-2021 Camptocamp SA
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define("web_send_message_popup.Chatter", function(require) {
    "use strict";

    var Chatter = require("mail.Chatter");

    Chatter.include({
        _onOpenComposerMessage: function() {
            this._super.apply(this, arguments);
            var self = this;
            this._suggestedPartnersProm.then(function() {
                self._composer._onOpenFullComposer();
            });
        },
    });
});
