/** @odoo-module **/
import {FormController} from "@web/views/form/form_controller";
import {evaluateExpr} from "@web/core/py_js/py";
import {patch} from "@web/core/utils/patch";

patch(FormController.prototype, "web_action_conditionable", {
    setup() {
        this._super(...arguments);
        owl.onWillRender(() => {
            return this._evaluate_web_action_conditionable();
        });
    },
    async _evaluate_web_action_conditionable() {
        for (const action of ["create", "delete", "duplicate", "edit"]) {
            try {
                this.archInfo.activeActions[action] = evaluateExpr(
                    this.archInfo.activeActions[action + "_expression"] || "True",
                    this.model.root.data
                );
                if (action === "edit") {
                    this.canEdit = this.archInfo.activeActions[action];
                    this.model.root.switchMode(this.canEdit ? "edit" : "readonly");
                }
                if (action === "create") {
                    this.canCreate = this.archInfo.activeActions[action];
                }
            } catch (exception) {
                console.log(exception);
            }
        }
    },
});
