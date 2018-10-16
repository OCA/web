/* Copyright 2016-2017 Jairo Llopis <jairo.llopis@tecnativa.com>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_editor_background_color.colorpicker", function (require) {
    "use strict";
    var options = require("web_editor.snippets.options");
    var colorpicker = options.registry.colorpicker;

    colorpicker.include({
        events: _.extend({}, colorpicker.prototype.events, {
            "changeColor [data-name=custom_color]":
                "set_inline_background_color",
            // Remove inline background-color for normal class-based buttons
            "click .o_colorpicker_section button[data-color]":
                "remove_inline_background_color",
            "click [data-name=custom_color] input": "input_select",
            "click [data-name=custom_color]": "custom_abort_event",
            "keydown [data-name=custom_color]": "custom_abort_event",
            "keypress [data-name=custom_color]": "custom_abort_event",
            "keyup [data-name=custom_color]": "custom_abort_event",
        }),
        xmlDependencies: colorpicker.prototype.xmlDependencies.concat([
            "/web_editor_background_color/static/src/xml/colorpicker.xml",
        ]),

        /**
         * @override
         */
        start: function () {
            this._super();
            // Enable custom color picker
            this.$custom = this.$el.find('[data-name="custom_color"]');
            this.$custom.colorpicker({
                color: this.$target.css("background-color"),
                container: true,
                inline: true,
                sliders: {
                    saturation: {
                        maxLeft: 118,
                        maxTop: 118,
                    },
                    hue: {
                        maxTop: 118,
                    },
                    alpha: {
                        maxTop: 118,
                    },
                },
            });
            // Activate border color changes if it matches background's
            var style = this.$target.prop("style");
            this.change_border =
                style["border-color"] &&
                style["background-color"] === style["border-color"];
        },

        /**
         * A HACK to avoid dropdown disappearing when picking colors
         *
         * @param {Event} event
         */
        custom_abort_event: function (event) {
            event.stopPropagation();
        },

        /**
         * Select the color picker input
         *
         * @param {Event} event
         */
        input_select: function (event) {
            $(event.target).focus().select();
        },

        /**
         * Undo the inline background color, besides upstream color classes
         *
         * @override
         */
        _onColorResetButtonClick: function (event) {
            this._super.apply(this, arguments);
            this.$target.css("background-color", "");
            if (this.change_border) {
                this.$target.css("border-color", "");
            }
            this.$target.trigger("background-color-event", event.type);
        },

        /**
         * Apply the chosen color as an inline style
         *
         * @param {Event} event
         */
        set_inline_background_color: function (event) {
            var color = String(event.color);
            this.$target.css("background-color", color);
            if (this.change_border) {
                this.$target.css("border-color", color);
            }
            this.$target.trigger("background-color-event", event.type);
        },
    });
});
