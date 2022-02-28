odoo.define("web.boolean_button_widget", function(require) {
    "use strict";

    var AbstractField = require("web.AbstractField");
    var registry = require("web.field_registry");
    var translation = require("web.translation");
    var _t = translation._t;

    var FieldBooleanButton = AbstractField.extend({
        className: "o_stat_info",
        supportedFieldTypes: ["boolean"],

        // --------------------------------------------------------------------------
        // Public
        // --------------------------------------------------------------------------

        /**
         * A boolean field is always set since false is a valid value.
         *
         * @override
         */
        isSet: function() {
            return true;
        },

        // --------------------------------------------------------------------------
        // Private
        // --------------------------------------------------------------------------

        /**
         * This widget is supposed to be used inside a stat button and, as such, is
         * rendered the same way in edit and readonly mode.
         *
         * @override
         * @private
         */

        _render: function() {
            this.$el.empty();
            var text = null,
                hover = null;
            switch (this.nodeOptions.terminology) {
                case "active":
                    text = this.value ? _t("Active") : _t("Inactive");
                    hover = this.value ? _t("Deactivate") : _t("Activate");
                    break;
                case "archive":
                    text = this.value ? _t("Active") : _t("Archived");
                    hover = this.value ? _t("Archive") : _t("Restore");
                    break;
                case "close":
                    text = this.value ? _t("Active") : _t("Closed");
                    hover = this.value ? _t("Close") : _t("Open");
                    break;
                default:
                    var opt_terms = this.nodeOptions.terminology || {};
                    if (typeof opt_terms === "string") {
                        opt_terms = {}; // Unsupported terminology
                    }
                    text = this.value
                        ? _t(opt_terms.string_true) || _t("On")
                        : _t(opt_terms.string_false) || _t("Off");
                    hover = this.value
                        ? _t(opt_terms.hover_true) || _t("Switch Off")
                        : _t(opt_terms.hover_false) || _t("Switch On");
            }
            var valColor = this.value ? "text-success" : "text-danger";
            var hoverColor = this.value ? "text-danger" : "text-success";
            var $val = $("<span>")
                .addClass("o_stat_text o_not_hover " + valColor)
                .text(text);
            var $hover = $("<span>")
                .addClass("o_stat_text o_hover " + hoverColor)
                .text(hover);
            this.$el.append($val).append($hover);
        },
    });

    registry.add("boolean_button", FieldBooleanButton);
});
