odoo.define('web_widget_precisions.uom_widget', function (require) {
    "use strict";

    var field_registry = require('web.field_registry');
    var fields = require('web.basic_fields');
    var field_utils = require('web.field_utils');
    var rpc = require('web.rpc');
    var uom_precisions = [];
    rpc.query({
        model: 'uom.view.precision.backend',
        method: 'get_uom_view_precisions',
    }).then(
        function (precision_data) {
            uom_precisions = precision_data;
        }
    );

    var FieldUom = fields.InputField.extend({
        className: 'o_field_uom o_field_number',
        tagName: 'span',
        supportedFieldTypes: ['float', 'integer'],
        resetOnAnyFieldChange: true,

        init: function () {
            this._super.apply(this, arguments);

            if (this.mode === 'edit') {
                this.tagName = 'div';
                this.className += ' o_input';
            }
        },

        isSet: function () {
            return this.value === 0 || this._super.apply(this, arguments);
        },


        /**
         * @override
         * @private
         */
        _formatValue: function () {
            if (this.value === false) {
                return "";
            }
            var UomField = this.nodeOptions.uom_field || 'uom_id';
            var UomID = this.record.data[UomField] && this.record.data[UomField].res_id;
            var UomPrecision = uom_precisions[UomID];
            var digits = [16, 3]; // default precision
            if (UomPrecision !== undefined) {
                digits = [16, UomPrecision];
            } else {
                digits = this.field.digits || digits;
            }
            return field_utils.format.float(this.value, this.field,
                _.extend({}, this.formatOptions, {digits: digits})
            );
        },

        _renderEdit: function () {
            this.$el.empty();

            this._prepareInput(this.$input).appendTo(this.$el);

        },

        _renderReadonly: function () {
            this.$el.empty().text(this._formatValue());
        },

        _reset: function () {
            this._super.apply(this, arguments);
        },
    });

    field_registry.add('uom', FieldUom);

    return {
        FieldUom: FieldUom,
    };
});
