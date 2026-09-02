/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { registry } from "@web/core/registry";
import { router } from "@web/core/browser/router";
import { actionService } from "@web/webclient/actions/action_service";
import { DiagramController } from "./diagram_controller";

export const diagramView = {
    type: "diagram",
    display_name: "Diagram",
    icon: "fa-code-fork",
    multiRecord: false,
    Controller: DiagramController,
};

registry.category("views").add("diagram", diagramView);

/**
 * Patch for Odoo 18 bug: when the page is loaded/reloaded from a URL that
 * includes a resId (e.g. a bookmarked form record), Odoo's loadState() creates
 * a "lazy breadcrumb controller" for the multi-record view. This controller
 * gets action.jsId assigned but never receives a `view` property.
 *
 * When switchView() later searches controllerStack for non-multiRecord
 * controllers of the same action it runs:
 *   ct.action.jsId === controller.action.jsId && !ct.view.multiRecord
 * The lazy controller matches on jsId but ct.view is undefined → TypeError.
 *
 * Workaround: catch the specific TypeError and retry via doAction() with
 * stackPosition:"replaceCurrentAction", which uses a different findIndex that
 * only checks jsId (no ct.view access).
 */
patch(actionService, {
    start(env) {
        const mgr = super.start(env);
        const origSwitchView = mgr.switchView;

        mgr.switchView = async (viewType, props = {}) => {
            // When switching to a non-multiRecord view, carry the current resId
            // forward so the URL retains the record ID.  Without this, the
            // action service falls back to action.res_id which is often false
            // for list-opened actions, dropping the ID from the URL.
            if (!props.resId) {
                const viewDef = registry.category("views").get(viewType, null);
                if (viewDef && !viewDef.multiRecord) {
                    const ctrlResId = mgr.currentController?.props?.resId;
                    const routerResId = router.current.resId;
                    const resId =
                        ctrlResId ||
                        (typeof routerResId === "number" ? routerResId : false);
                    if (resId) {
                        props = { ...props, resId };
                    }
                }
            }
            try {
                return await origSwitchView(viewType, props);
            } catch (e) {
                if (
                    !(e instanceof TypeError) ||
                    !String(e.message).includes("multiRecord")
                ) {
                    throw e;
                }
                // Lazy controller bug: fall back to doAction with
                // replaceCurrentAction which does not access ct.view.
                const ctrl = mgr.currentController;
                const actionId = ctrl?.action?.id;
                if (!actionId) {
                    throw e;
                }
                return mgr.doAction(actionId, {
                    viewType,
                    props: props.resId ? { resId: props.resId } : {},
                    stackPosition: "replaceCurrentAction",
                });
            }
        };

        return { ...mgr, switchView: mgr.switchView };
    },
});
