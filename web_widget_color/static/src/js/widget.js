odoo.define('web.web_widget_color', function(require) {
    "use strict";

    var core = require('web.core');
    var widget = require('web.form_widgets');
    var FormView = require('web.FormView');

    var QWeb = core.qweb;
    var _lt = core._lt;

    var _super_getDir = jscolor.getDir.prototype;
    jscolor.getDir = function () {
        var dir = _super_getDir.constructor();
        if (dir.indexOf('web_widget_color') === -1) {
            jscolor.dir = 'web_widget_color/static/lib/jscolor/';
        }
        return jscolor.dir;
    };

    var FieldColor = widget.FieldChar.extend({
        template: 'FieldColor',
        widget_class: 'oe_form_field_color',
        is_syntax_valid: function () {
            var $input = this.$('input');
            if (!this.get("effective_readonly") && $input.size() > 0) {
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
        store_dom_value: function() {
            if (!this.silent) {
                if (!this.get('effective_readonly') &&
                    this.$('input').val() !== '' &&
                    this.is_syntax_valid()) {
                    // We use internal_set_value because we were called by
                    // ``.commit_value()`` which is called by a ``.set_value()``
                    // itself called because of a ``onchange`` event
                    this.internal_set_value(
                        this.parse_value(
                            this.$('input').val())
                        );
                }
            }
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

    core.form_widget_registry.add('color', FieldColor);

    /*
     * Init jscolor for each editable mode on view form
     */
    FormView.include({
        to_edit_mode: function () {
            this._super();
            jscolor.init(this.$el[0]);
        }
    });

    return {
        FieldColor: FieldColor
    };
});
