/** @odoo-module **/
import {FormRenderer} from "@web/views/form/form_renderer";
import {patch} from "@web/core/utils/patch";
import {onMounted} from "@odoo/owl";
patch(FormRenderer.prototype, "web_form_view_resizable", {
    setup() {
        this._super(...arguments);
        onMounted(() => this._mounted());
    },
    _mounted() {
        $("div.o_form_view_container").resizable({
            handles: "e",
            minWidth: window.innerWidth * 0.1,
            maxWidth: window.innerWidth * 0.9,
            classes: {
                "ui-resizable": "remove_flex",
            },
            // Allow user to drag over the preview of a pdf
            start: function () {
                $("div.o_attachment_preview").addClass("remove_hover_effect");
            },
            stop: function () {
                $("div.o_attachment_preview").removeClass("remove_hover_effect");
            },
        });
    },
});
