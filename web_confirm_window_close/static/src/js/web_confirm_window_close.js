// Copyright 2013 Therp BV (<http://therp.nl>)
//           2017 Opener B.V. (<https://opener.amsterdam>)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define('web_confirm_window_close', function (require) {
    "use strict";
    var WebClient = require('web.WebClient');

    WebClient.include({
        warning_on_close: function(e) {
            if ($('html').find('.oe_form_dirty').length) {
                e.preventDefault();
            }
        },

        start: function() {
            var res = this._super();
            $(window).on("beforeunload", _.bind(this.warning_on_close, this));
            return res;
        }

    });
});
