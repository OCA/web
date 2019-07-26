/* Copyright 2019 Camptocamp SA
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define('web_send_message_popup.Chatter', function (require) {
    "use strict";

    var Chatter = require('mail.Chatter');

    Chatter.include({
        _onOpenComposerMessage: function () {
            this._super.apply(this, arguments);
            this.suggested_partners_def.done($.proxy(function () {
                this._closeComposer(true);
                this._composer._onOpenFullComposer();
            }, this));
        },
    });
});
