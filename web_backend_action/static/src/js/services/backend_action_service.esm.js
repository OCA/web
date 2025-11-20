import {registry} from "@web/core/registry";

export const backendActionService = {
    dependencies: ["bus_service", "action"],

    /**
     * Initialise the service and register the bus listener.
     *
     * @param {Object} env - The OWL environment
     * @param {Object} services - Injected services
     * @param {Object} services.bus_service - The bus service
     * @param {Object} services.action - The action service
     */
    start(env, {bus_service, action}) {
        bus_service.subscribe("web.backend_action", async (payload) => {
            const {
                action: targetAction,
                res_model: targetModel,
                res_id: targetRecordId,
                view_types: targetViews = [],
            } = payload || {};

            // Check if the target action is specified
            if (!targetAction) {
                return;
            }

            // Check if the current controller is available
            const controller = action.currentController;
            if (!controller) {
                return;
            }

            // Get the current model, view type and record id
            const resModel = controller.props?.resModel;
            const resId = controller.props?.resId;
            const viewType = controller.view?.type || controller.props?.type;

            // Check if the target model is the same as the current model (if specified)
            if (targetModel && targetModel !== resModel) {
                return;
            }

            // Check if the target record is the same as the current record (if specified)
            if (targetRecordId && targetRecordId !== resId) {
                return;
            }

            // Check if the target view type is the same as the current view type (if specified)
            if (targetViews.length && !targetViews.includes(viewType)) {
                return;
            }

            try {
                await action.doAction(targetAction);
            } catch (err) {
                console.error("Error executing backend action:", err, targetAction);
            }
        });
        bus_service.start();
    },
};

// Register the service under the ``services`` category so it gets
// instantiated during the webclient bootstrap.
registry.category("services").add("backend_action", backendActionService);
