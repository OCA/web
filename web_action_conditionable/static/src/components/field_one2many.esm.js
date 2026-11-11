/* global console */
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {patch} from "@web/core/utils/patch";
import {X2ManyField} from "@web/views/fields/x2many/x2many_field";

patch(X2ManyField.prototype, {
    get rendererProps() {
        this.updateActiveActions();
        return super.rendererProps;
    },
    updateActiveActions() {
        const archInfo = this.archInfo;
        if (
            this.props.viewMode === "list" &&
            this.activeActions.type === "one2many" &&
            !this.props.readonly &&
            archInfo?.xmlDoc
        ) {
            const xmlDoc = archInfo.xmlDoc;
            for (const action of ["create", "delete"]) {
                if (action in this.activeActions && xmlDoc.hasAttribute(action)) {
                    const expr = xmlDoc.getAttribute(action);
                    try {
                        this.activeActions[action] = evaluateBooleanExpr(
                            expr,
                            this.props.record.evalContext
                        );
                    } catch (error) {
                        console.warn(
                            "[web_action_conditionable] unrecognized expr '" +
                                expr +
                                "', ignoring"
                        );
                        console.warn(error);
                    }
                }
            }
        }
    },
});
