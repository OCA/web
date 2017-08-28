/* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_decimal_numpad_dot.FieldFloat", function (require) {
    "use strict";

    var form_widgets = require("web.form_widgets");
    var translation = require("web.translation");

    form_widgets.FieldFloat.include({
        init: function () {
            this.events.keypress = function (event) {
                if (event.which === 46 || event.which === 44) {
                    event.preventDefault();
                    var input = this.$input || this.$("input");
                    var l10n = translation._t.database.parameters;
                    if (!_.str.contains(input.val(), l10n.decimal_point)) {
                        try {
                            var caret_pos = input[0].selectionStart;
                            var selection_end = input[0].selectionEnd;
                            var cur_val = input.val();
                            var newval = cur_val.substring(0, caret_pos) + l10n.decimal_point + cur_val.substring(selection_end);
                            input.val(newval);
                            input[0].selectionStart = input[0].selectionEnd = caret_pos + 1;
                        } catch (error) {
                            //fallback to appending if no caret position can be determined
                            input.val(input.val() + l10n.decimal_point);
                        }
                    }
                }
            };
            return this._super.apply(this, arguments);
        }
    });
});
