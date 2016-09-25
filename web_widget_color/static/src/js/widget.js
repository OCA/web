odoo.define('web_widget_color.FieldColor', function (require) {
"use strict";

var core = require('web.core');
var FieldChar = core.form_widget_registry.get('char');
var FormView = require('web.FormView');
var _super_getDir = jscolor.getDir.prototype;

jscolor.getDir = function () {
    var dir = _super_getDir.constructor();
    if (dir.indexOf('web_widget_color') === -1) {
        jscolor.dir = 'web_widget_color/static/lib/jscolor/';
    }
    return jscolor.dir;
};

var FieldColor = FieldChar.extend({
    template: 'FieldColor',
    widget_class: 'oe_form_field_color',
    is_syntax_valid: function () {
        var $input = this.$('input');
        if (!this.get("effective_readonly") && $input.size() > 0 && $input.val()) {
            var val = $input.val();
            var isOk = /^#[0-9A-F]{6}$/i.test(val);
            if (!isOk) {
                return false;
            }
            try {
                this.parse_value(this.$('input').val(), '');
                return true;
            } catch (e) {
                return false;
            }
        }
        return true;
    },
    render_value: function () {
        var show_value = this.format_value(this.get('value'), '');
        if (!this.get("effective_readonly")) {
            var $input = this.$el.find('input');
            $input.val(show_value);
            $input.css("background-color", show_value)
            jscolor.init(this.$el[0]);
        } else {
            this.$(".oe_form_char_content").text(show_value);
            this.$('div').css("background-color", show_value)
        }
    }
});

/*
 * Init jscolor for each editable mode on view form
 */
FormView.include({
    to_edit_mode: function () {
        this._super();
        jscolor.init(this.$el[0]);
    }
});

core.form_widget_registry
    .add('color', FieldColor)
});