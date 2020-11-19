/* Copyright 2016-2019 Tecnativa - Jairo Llopis
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_editor_background_color.colorpicker", function(require) {
    "use strict";
    var ColorpickerDialog = require("web.ColorpickerDialog");
    var options = require("web_editor.snippets.options");
    var colorpicker = options.registry.colorpicker;

    colorpicker.include({
        custom_events: _.extend({}, colorpicker.prototype.custom_events, {
            "colorpicker:saved": "_onCustomColorSave",
        }),
        events: _.extend({}, colorpicker.prototype.events, {
            "click .o_colorpicker_section[data-name=custom]> #add-color":
                "_onCustomColorAsk",
        }),

        /**
         * Called when the user clicks on "Custom color" section header
         */
        _onCustomColorAsk: function() {
            var dialog = new ColorpickerDialog(this, {
                defaultColor: this.$target.css("background-color"),
            });
            dialog.open();
        },

        /**
         * Called when the user saves a custom color
         *
         * @param {Event} event
         */
        _onCustomColorSave: function(event) {
            // Add a button to remind recent choices
            var $button = $("<button/>", {
                class: "o_custom_color",
                css: {
                    "background-color": event.data.cssColor,
                },
            });
            var $custom = this.$el.find(".o_colorpicker_section[data-name=custom]");
            $custom.append($button);
            // Emulate a hover & click on that new button
            $button.mouseenter().click();
        },
    });
});
