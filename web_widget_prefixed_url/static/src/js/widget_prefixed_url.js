odoo.define('web_widget_prefixed_url.WidgetPrefixedUrlCustom', function (require) {
    "use strict";

    var field_registry = require('web.field_registry');
    var basic_fields = require('web.basic_fields');

    var WidgetPrefixedUrlCustom = basic_fields.FieldEmail.extend({

        /**
         * In readonly, emails should be a mailto: link with proper formatting.
         *
         * @override
         * @private
         */
        _renderReadonly: function () {
            if (_.isEmpty(this.attrs.options.prefix_name)) {
                this.$el.text(this.value);
            } else {
                var prefix = this.attrs.options.prefix_name;
                this.$el.text(this.value)
                    .addClass('o_form_uri o_text_overflow')
                    .attr('href', prefix + ':' + this.value);
            }
        },
    });

    field_registry.add('prefixed_url', WidgetPrefixedUrlCustom);

    return WidgetPrefixedUrlCustom;
});
