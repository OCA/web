/** @odoo-module **/
import {X2ManyField} from "@web/views/fields/x2many/x2many_field";
import {evaluateExpr} from "@web/core/py_js/py";
import {patch} from "@web/core/utils/patch";

patch(X2ManyField.prototype, {
    get rendererProps() {
        this.updateActiveActions();
        return super.rendererProps;
    },
    updateActiveActions() {
        if (
            this.props.viewMode === "list" &&
            this.activeActions.type === "one2many" &&
            !this.props.readonly
        ) {
            const self = this;
            const archInfo = this.activeField.views[this.props.viewMode];
            const xmlDoc = archInfo.xmlDoc;
            ["create", "delete"].forEach(function (item) {
                if (item in self.activeActions && xmlDoc.hasAttribute(item)) {
                    const expr = xmlDoc.getAttribute(item);
                    try {
                        self.activeActions[item] = evaluateExpr(
                            expr,
                            self.props.record.data
                        );
                    } catch (ignored) {
                        console.log(
                            "[web_action_conditionable] unrecognized expr '" +
                                expr +
                                "', ignoring"
                        );
                    }
                }
            });
        }
    },
});
