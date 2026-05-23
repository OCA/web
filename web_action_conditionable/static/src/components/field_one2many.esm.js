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
        if (this.props.viewMode === "list" && this.activeActions.type === "one2many") {
            const listView = this.props.views[this.props?.viewMode];
            const xmlDoc = listView.xmlDoc;
            if (!xmlDoc) {
                return;
            }
            ["create", "delete"].forEach((item) => {
                if (this.activeActions[item] && xmlDoc.hasAttribute(item)) {
                    const expr = xmlDoc.getAttribute(item);
                    try {
                        this.activeActions[item] = evaluateExpr(
                            expr,
                            this.props.record.data
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
