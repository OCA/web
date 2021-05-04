/* Copyright 2018 Simone Orsi - Camptocamp SA
License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html). */

odoo.define("web_widget_url_advanced", function(require) {
    "use strict";

    var basic_fields = require("web.basic_fields");

    basic_fields.UrlWidget.include({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            // Retrieve customized `<a />` text from a field
            // via `text_field` attribute or `options.text_field`
            this.text_field = this.attrs.text_field || this.attrs.options.text_field;
        },
        /**
         * Retrieve anchor text based on options.
         * @returns {String}
         */
        _get_text: function() {
            if (this.text_field) {
                var field_value = this.recordData[this.text_field];
                if (_.isObject(field_value) && _.has(field_value.data)) {
                    field_value = field_value.data.display_name;
                }
                return field_value;
            }
            return this.attrs.text;
        },
        /**
         *
         * @override
         * @private
         */
        _renderReadonly: function() {
            // Base widget uses `this.attrs.text` instead of `this.value` when available.
            this.attrs.text = this._get_text();
            this._super.apply(this, arguments);
            var prefix = this.attrs.prefix_name || this.attrs.options.prefix_name;
            if (prefix) {
                this.$el.attr("href", prefix + ":" + this.value);
            }
        },
    });
});
