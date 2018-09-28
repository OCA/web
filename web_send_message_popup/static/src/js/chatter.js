/* Copyright 2018 Camptocamp SA
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define('web_send_message_popup.Chatter', function (require) {
    "use strict";

    var Chatter = require('mail.Chatter');

    Chatter.include({
        _onOpenComposerMessage: function () {
            // wait for composer input to be initialized
            // taken from http://stackoverflow.com/questions/7307983/while-variable-is-not-defined-wait
            var self = this;
            $.when(this._super.apply(this, arguments)).then(function () {
                function checkVariable() {
                    if (typeof self.composer !== 'undefined' && typeof self.composer.$input !== 'undefined') {
                        self.composer.on_open_full_composer();
                    }
                    else {
                        setTimeout(function () {
                            checkVariable();
                        }, 50);
                    }
                }
                checkVariable();
            });
        }
    });
});
