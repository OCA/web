/* © 2016 Camptocamp SA
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define('web_send_message_popup.Chatter', function (require) {
"use strict";

var core = require('web.core');
var composer = require('mail.composer');
var Chatter = core.form_widget_registry.get('mail_thread');

Chatter.include({
    on_open_composer_new_message: function () {
        var self = this;
        this.open_composer();
        // wait for composer input to be initialized
        // taken from http://stackoverflow.com/questions/7307983/while-variable-is-not-defined-wait
        function checkVariable() {
            if (typeof self.composer !== 'undefined' && typeof self.composer.$input !== 'undefined') {
                self.composer.on_open_full_composer();
            }
            else {
                setTimeout(function() {
                    checkVariable();
                }, 50);
            }
        }
        checkVariable();
    }
});
});
