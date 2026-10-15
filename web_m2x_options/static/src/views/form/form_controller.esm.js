import {FormController} from "@web/views/form/form_controller";
import {isX2Many} from "@web/views/utils";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(FormController.prototype, {
    /**
     * @override
     */
    setup() {
        super.setup(...arguments);
        this._setSubViewLimit();
    },
    /**
     * Add more method to add subview limit on formview
     */
    async _setSubViewLimit() {
        const ir_options = session.web_m2x_options || {};
        const activeFields = this.archInfo.fieldNodes;
        const limit = parseInt(ir_options["web_m2x_options.field_limit_entries"], 10);
        if (!Number.isFinite(limit) || limit <= 0) {
            return;
        }
        for (const fieldName in activeFields) {
            const field = activeFields[fieldName];
            if (!isX2Many(field)) {
                // What follows only concerns x2many fields
                continue;
            }
            if (field.invisible === "True" || field.invisible === "1") {
                // No need to fetch the sub view if the field is always invisible
                continue;
            }

            if (!field.field.useSubView) {
                // The FieldComponent used to render the field doesn't need a sub view
                continue;
            }
            let viewType = field.viewMode || "list,kanban";
            if (viewType.includes(",")) {
                viewType = this.ui.isSmall ? "kanban" : "list";
            }
            field.viewMode = viewType;
            if (field.views?.[viewType]) {
                field.views[viewType].limit = limit;
            }
        }
    },
});
