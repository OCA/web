/* Global jscolor */
odoo.define('web.web_widget_color', function(require) {
    "use strict";

    var basic_fields = require('web.basic_fields');
    var field_registry = require('web.field_registry');
    var ListRenderer = require('web.ListRenderer');

    var FieldColor = basic_fields.FieldChar.extend({
        template: 'FieldColor',
        widget_class: 'oe_form_field_color',

        _renderReadonly: function () {
            // Do Nothing
        },

        _renderEdit: function() {
            this.$input = this.$el.find('input');
            this.jscolor = new jscolor(this.$input[0], {hash:true, zIndex:2000});
        },
    });
    field_registry.add('color', FieldColor);

    // Deny unselect row if jscolor actived
    ListRenderer.include({
        unselectRow: function () {
            var canUnselect = true;
            if (this.currentRow !== null) {
                var record = this.state.data[this.currentRow];
                var recordWidgets = this.allFieldWidgets[record.id];
                canUnselect = !_.some(recordWidgets, function (widget) {
                    var $el = widget.getFocusableElement();
                    return ($el instanceof jQuery && $el.hasClass('jscolor-active'));
                });
            }

            if (canUnselect) {
                return this._super.apply(this, arguments);
            } else {
                return $.Deferred().resolve();
            }
        },
    });

    return FieldColor;
});
