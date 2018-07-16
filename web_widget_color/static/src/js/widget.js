odoo.define('web.web_widget_color', function(require) {
    "use strict";

    var basic_fields = require('web.basic_fields');
    var field_registry = require('web.field_registry');
    var FormController = require('web.FormController');
    var ListRenderer = require('web.ListRenderer');

    var FieldColor = basic_fields.FieldChar.extend({
        template: 'FieldColor',
        widget_class: 'oe_form_field_color',

        _renderReadonly: function () {
            // Do Nothing
        },

        _renderEdit: function() {
            var self = this;
            // FIXME: For some reason needs 1ms delay for initilize jscolor...
            _.delay(function(){
                self.$input = self.$el.find('input');
                jscolor.installByClassName('jscolor');
            }, 1);
        }
    });
    field_registry.add('color', FieldColor);

    // Deny unselect row when a field color has the focus
    ListRenderer.include({
        unselectRow: function () {
            var canUnselect = true;
            if (this.currentRow !== null) {
                var record = this.state.data[this.currentRow];
                var recordWidgets = this.allFieldWidgets[record.id];
                _.each(recordWidgets, function (widget) {
                    var $el = widget.getFocusableElement();
                    if ($el.hasClass('jscolor') && $el.is(":focus")) {
                        canUnselect = false;
                        return false;
                    }
                });
            }

            return canUnselect?this._super.apply(this, arguments):$.when();
        },
    });

    return FieldColor;
});
