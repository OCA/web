/* Copyright 2016-2017 Jairo Llopis <jairo.llopis@tecnativa.com>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_editor_background_color.colorpicker", function (require) {
    "use strict";
    var ajax = require("web.ajax");
    var core = require("web.core");
    var options = require("web_editor.snippets.options");

    var ready = ajax.loadXML(
        "/web_editor_background_color/static/src/xml/colorpicker.xml",
        core.qweb
    );

    options.registry.colorpicker.include({
        bind_events: function () {
            this._super();
            // Remove inline background-color for normal class-based buttons
            this.$el.find(".colorpicker button").on(
                "click",
                $.proxy(this.remove_inline_background_color, this)
            );
            // Enable custom color picker
            this.$custom = this.$el.find(".bg-custom");
            this.$custom.colorpicker({
                color: this.$target.css("background-color"),
                container: true,
            });
            this.$custom.on(
                "changeColor",
                $.proxy(this.set_inline_background_color, this)
            );
            this.$custom.on(
                "click",
                "input",
                $.proxy(this.input_select, this)
            );
            // Activate border color changes if it matches background's
            var style = this.$target.prop("style");
            this.change_border =
                style["border-color"] &&
                style["background-color"] == style["border-color"];
        },
        input_select: function (event) {
            // HACK Avoid dropdown disappearing when clicking on input
            event.stopPropagation();
            $(event.target).focus().select();
            this.$custom.colorpicker("show");
        },
        remove_inline_background_color: function (event) {
            this.$target.css("background-color", "");
            if (this.change_border) {
                this.$target.css("border-color", "");
            }
        },
        set_inline_background_color: function (event) {
            var color = String(event.color);
            this.$target.css("background-color", color);
            if (this.change_border) {
                this.$target.css("border-color", color);
            }
        },
    });

    return {
        ready: ready,
        colorpicker: options.registry.colorpicker,
    };
});
