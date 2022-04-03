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

            this._setUom();

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
        _formatValue: function (value, field, options) {
            if (value === false) {
                return "";
            }
            options = options || {};

            var uom = options.uom;
            if (uom === undefined) {
                var uom_id = options.uom_id;
                if (!uom_id && options.data) {
                    var uom_field = options.uom_field || field.uom_field || 'uom_id';
                    uom_id = options.data[uom_field] && options.data[uom_field].res_id;
                }
                uom = uom_precisions[uom_id];
            }

            var digits = [16, (uom)] || options.digits;

            if (options.field_digits === true) {
                digits = field.digits || digits;
            }
            return field_utils.format.float(value, field,
                _.extend({}, options, {digits: digits})
            );
        },

        _renderEdit: function () {
            this.$el.empty();

            this._prepareInput(this.$input).appendTo(this.$el);

        },

        _renderReadonly: function () {
            this.$el.empty().text(this._formatValue(this.value, this.field, this.formatOptions));
        },

        _reset: function () {
            this._super.apply(this, arguments);
            this._setUom();
        },

        _setUom: function () {
            var UomField = this.nodeOptions.uom_field || this.field.uom_field || 'uom_id';
            var UomID = this.record.data[UomField] && this.record.data[UomField].res_id;
            this.formatOptions.uom = uom_precisions[UomID]; // _formatValue() uses formatOptions
            this.formatOptions.uom_field = UomField;
            this.formatOptions.digits = [16, 3];
        },
    });

    field_registry.add('uom', FieldUom);

    return {
        FieldUom: FieldUom,
    };
});
