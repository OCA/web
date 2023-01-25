odoo.define("web_chatter_position.chatter_position", function (require) {
    "use strict";

    const {patch} = require("@web/core/utils/patch");
    const {FormController} = require("@web/views/form/form_controller");
    const {
        FormControlPanel,
    } = require("@web/views/form/control_panel/form_control_panel");
    const {SIZES} = require("@web/core/ui/ui_service");

    patch(FormControlPanel.prototype, "web_chatter_position", {
        _onChatterPosition() {
            var $webClient = $(this.root.el).offsetParent();
            if ($webClient.hasClass("o_chatter_position_bottom")) {
                $webClient.toggleClass(
                    "o_chatter_position_sided o_chatter_position_bottom"
                );
            } else if ($webClient.hasClass("o_chatter_position_sided")) {
                $webClient.toggleClass(
                    "o_chatter_position_sided o_chatter_position_bottom"
                );
            }
        },
    });

    patch(FormController.prototype, "web_chatter_position", {
        get className() {
            var result = this._super();
            const {size} = this.ui;
            if (size <= SIZES.XS) {
                result.o_xxs_form_view = true;
            } else {
                result.o_xxs_form_view = false;
            }
            return result;
        },
    });
});
