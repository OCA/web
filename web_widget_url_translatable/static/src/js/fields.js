// Copyright 2019 Camptocamp SA
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
//
odoo.define('web_widget_url_translatable', function (require) {
    "use strict";

    var basic_fields = require('web.basic_fields');

    basic_fields.UrlWidget.include(basic_fields.TranslatableFieldMixin);
    basic_fields.UrlWidget.include({

    /* Add translation button */

        _renderEdit: function () {
            var def = this._super.apply(this, arguments);
            if (this.field.size && this.field.size > 0) {
                this.$el.attr('maxlength', this.field.size);
            }
            this.$el = this.$el.add(this._renderTranslateButton());
            return def;
        },
    });

});
