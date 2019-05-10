/* Global jscolor */
odoo.define('web.web_widget_uom', function(require) {
    "use strict";

    var basic_fields = require('web.basic_fields');
    var field_registry = require('web.field_registry');
    var session = require('web.session');
    var rpc = require('web.rpc');

    var FieldUoM = basic_fields.FieldFloat.extend({
        /**
         * Float fields have an additional precision parameter that is read from
         * either the field node in the view or the field python definition itself.
         *
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            var decimal_places = 4;
        },

        /**
         * main rendering function.  Override this if your widget has the same render
         * for each mode.  Note that this function is supposed to be idempotent:
         * the result of calling 'render' twice is the same as calling it once.
         * Also, the user experience will be better if your rendering function is
         * synchronous.
         *
         * @private
         * @returns {Deferred|undefined}
         */
        _render: function () {
            var self = this;
            var parent = this._super;
            this._getDecimalPlaces().then(function (){
                parent.apply(self, arguments);
            });
        },

        _getDecimalPlaces: function () {
            var self = this;
            var uomField = this.nodeOptions.uom_field || this.field.uom_field || 'uom_id';
            var uomID = this.record.data[uomField] && this.record.data[uomField].res_id;

            return this._rpc({
                model: 'uom.uom',
                method: 'get_decimal_places',
                args: [,uomID],
            }).then(function(result) {
                if (result != null) {
                    self.nodeOptions.digits = [32, result];
                }
            });
        },

    });

    field_registry.add('uom', FieldUoM)

    return {
        FieldUoM: FieldUoM,
    }

});
