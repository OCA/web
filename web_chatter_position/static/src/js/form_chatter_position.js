// Copyright 2022 Hynsys Technologies
// License LGPL - 3.0 or later(http://www.gnu.org/licenses/lgpl).

odoo.define("web_chatter_position.ChatterPositionFormController", function (require) {
    "use strict";

    var config = require("web.config");
    var FormController = require("web.FormController");
    var FormRenderer = require("web.FormRenderer");

    var ChatterPositionFormController = FormController.include({
        renderButtons: function () {
            this._super.apply(this, arguments);
            if (this.$buttons) {
                this.$buttons.on(
                    "click",
                    ".o_chatter_position_button",
                    this._onChatterPosition.bind(this)
                );
            }
        },

        _onChatterPosition: function () {
            if (this.$el.offsetParent().hasClass("o_chatter_position_bottom")) {
                this.$el
                    .offsetParent()
                    .attr("class", "o_web_client o_chatter_position_sided");
            } else if (this.$el.offsetParent().hasClass("o_chatter_position_sided")) {
                this.$el
                    .offsetParent()
                    .attr("class", "o_web_client o_chatter_position_bottom");
            }
        },
    });

    FormRenderer.include({
        _applyFormSizeClass: function () {
            const formEl = this.$el[0];
            if (config.device.size_class <= config.device.SIZES.XS) {
                formEl.classList.add("o_xxs_form_view");
            } else {
                formEl.classList.remove("o_xxs_form_view");
            }
        },
    });

    return ChatterPositionFormController;
});
