// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define('web_pwa_cache.FormPWARenderer', function (require) {
    "use strict";

    var FormRenderer = require('web.FormRenderer');
    var config = require('web.config');


    FormRenderer.include({

        /**
         * @override
         */
        _updateView: function () {
            var res = this._super.apply(this, arguments);
            if (this.arch.tag === "formpwa") {
                this.$el.addClass("o_form_pwa_view");
            }
            return res;
        },
    });

    var FormPWARenderer = FormRenderer.extend({
        className: "o_form_view o_form_pwa_view",

        /**
         * Adds custom class to apply custom styles in mobile mode
         *
         * @override
         */
        start: function () {
            if (config.device.size_class <= config.device.SIZES.XS) {
                this.$el.addClass('o_xxs_form_pwa_view');
            }
            return this._super.apply(this, arguments);
        },

    });

    return FormPWARenderer;
});
