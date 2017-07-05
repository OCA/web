/* Copyright 2016-2017 Jairo Llopis <jairo.llopis@tecnativa.com>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_editor_background_color.colorpicker", function (require) {
    "use strict";
    var ajax = require("web.ajax");
    var core = require("web.core");
    var options = require("web_editor.snippets.options");

    ajax.loadXML(
        "/web_editor_background_color/static/src/xml/colorpicker.xml",
        core.qweb
    );

    return options.registry.colorpicker.include({
        bind_events: function () {
            this._super();
            // Remove inline background-color for normal class-based buttons
            this.$el.find(".o_colorpicker_section button[data-color]").on(
                "click",
                $.proxy(this.remove_inline_background_color, this)
            );
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
            this.$custom.on(
                "changeColor",
                $.proxy(this.set_inline_background_color, this));
            this.$custom.on(
                "click keypress keyup keydown",
                $.proxy(this.custom_abort_event, this));
            this.$custom.on(
                "click", "input",
                $.proxy(this.input_select, this));
            this.$el.find(".note-color-reset").on(
                "click",
                $.proxy(this.remove_inline_background_color, this));
            // Activate border color changes if it matches background's
            var style = this.$target.prop("style");
            this.change_border =
                style["border-color"] &&
                style["background-color"] === style["border-color"];
        },
        custom_abort_event: function (event) {
            // HACK Avoid dropdown disappearing when picking colors
            event.stopPropagation();
        },
        input_select: function (event) {
            $(event.target).focus().select();
        },
        remove_inline_background_color: function (event) {
            this.$target.css("background-color", "");
            if (this.change_border) {
                this.$target.css("border-color", "");
            }
            this.$target.trigger("background-color-event", event.type);
        },
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
