/* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_decimal_numpad_dot.FieldFloat", function (require) {
    "use strict";

    var basic_fields = require("web.basic_fields");
    var translation = require("web.translation");

    var NumpadDotReplaceMixin = {
        init: function () {
            this.events = $.extend({}, this.events, {
                "keydown": "numpad_dot_replace",
            });
            return this._super.apply(this, arguments);
        },

        l10n_decimal_point: function () {
            return this.widget == "float_time"
                ? ":" : translation._t.database.parameters.decimal_point;
        },

        numpad_dot_replace: function (event) {
            // Only act on numpad dot key
            if (event.keyCode != 110) {
                return;
            }
            event.preventDefault();
            var from = this.$input.prop("selectionStart"),
                to = this.$input.prop("selectionEnd"),
                cur_val = this.$input.val(),
                point = this.l10n_decimal_point();
            // Replace selected text by proper character
            this.$input.val(
                cur_val.substring(0, from) +
                point +
                cur_val.substring(to)
            );
            // Put user caret in place
            to = from + point.length
            this.$input.prop("selectionStart", to).prop("selectionEnd", to);
        },
    }

    basic_fields.FieldFloat.include(NumpadDotReplaceMixin);
    basic_fields.FieldMonetary.include(NumpadDotReplaceMixin);

    return {
        NumpadDotReplaceMixin: NumpadDotReplaceMixin,
    }
});
