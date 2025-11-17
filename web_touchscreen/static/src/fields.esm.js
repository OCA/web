import {Field} from "@web/views/fields/field";
import {hasTouch} from "@web/core/browser/feature_detection";
import {patch} from "@web/core/utils/patch";
import {utils} from "@web/core/ui/ui_service";

patch(Field, {
    /**
     * @override
     * Whenever a x2many field loads a list we want to force the kanban view over the
     * list one if both options are available and a touchscreen is being used.
     */
    parseFieldNode(node) {
        const fieldInfo = super.parseFieldNode(...arguments);
        // If it's small, it's already handled in super. If the viewMode is already
        // kanban, there's no need to do anything. And the same goes for no touch
        // devices.
        if (utils.isSmall() || fieldInfo.viewMode === "kanban" || !hasTouch()) {
            return fieldInfo;
        }
        const viewMode = node.getAttribute("mode");
        const kanban_is_optional =
            (viewMode && viewMode.split(",").includes("kanban")) ||
            (fieldInfo.views?.list && fieldInfo.views?.kanban);
        if (fieldInfo.viewMode === "list" && kanban_is_optional) {
            fieldInfo.viewMode = "kanban";
        }
        return fieldInfo;
    },
});
