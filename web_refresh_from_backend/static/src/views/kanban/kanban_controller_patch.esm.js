/** @odoo-module **/

import {KanbanController} from "@web/views/kanban/kanban_controller";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {onWillUnmount} from "@odoo/owl";

patch(KanbanController.prototype, "web_refresh_from_backend.KanbanController", {
    setup() {
        this._super(...arguments);
        this.busService = useService("bus_service");
        this.notificationService = useService("notification");

        // Bind the handler to keep reference for cleanup
        this._boundBusHandler = this._onBusNotification.bind(this);

        // Subscribe to bus notifications
        this.busService.addEventListener("notification", this._boundBusHandler);

        // Cleanup on unmount
        onWillUnmount(() => {
            if (this.busService && this._boundBusHandler) {
                this.busService.removeEventListener(
                    "notification",
                    this._boundBusHandler
                );
            }
        });
    },

    /**
     * Handle bus notification for view refresh
     * @param {Event} event - Bus notification event
     */
    async _onBusNotification({detail: notifications}) {
        // Check if component is still alive
        if (!this.model || !this.model.root) {
            return;
        }

        for (const {payload, type} of notifications) {
            if (type === "web.refresh_view") {
                await this._handleViewRefresh(payload);
            }
        }
    },

    /**
     * Handle view refresh notification
     * @param {Object} notification - Notification payload
     */
    async _handleViewRefresh(notification) {
        const {model, view_types = [], rec_ids = []} = notification;

        // Check if the model matches
        if (this.props.resModel !== model) {
            return;
        }

        // Check if view_type matches (if specified)
        if (view_types.length > 0 && !view_types.includes("kanban")) {
            return;
        }

        // Check if record ID matches (if rec_ids is specified)
        if (rec_ids.length > 0) {
            const loadedIds = this.getLoadedRecordIds();
            const shouldReload = loadedIds.some((id) => rec_ids.includes(id));

            if (!shouldReload) {
                return;
            }
        }

        await this.refreshList();
    },

    /**
     * Refresh the kanban with actual data from server
     * @returns {Promise<void>}
     */
    async refreshList() {
        // Safety check: component might be destroyed
        if (!this.model || !this.model.root) {
            return;
        }

        const list = this.model.root;

        // Reload data from server
        try {
            await list.load();
        } catch (error) {
            const message =
                (error && error.data && error.data.message) ||
                (error && error.message) ||
                String(error);
            this.notificationService.add(
                this.env._t("Could not reload kanban. ") + message,
                {type: "danger"}
            );
            return;
        }

        // Update the view (only if component is still mounted)
        if (this.model && this.model.root) {
            this.render(true);
        }
    },

    /**
     * Get IDs of all loaded records on the current page
     * @returns {Array<Number>} Array of record IDs
     */
    getLoadedRecordIds() {
        const list = this.model.root;

        if (list.isGrouped) {
            // For grouped kanban, collect IDs from all groups
            const recordIds = [];
            const collectIds = (groups) => {
                for (const group of groups) {
                    if (group.list && group.list.records) {
                        recordIds.push(...group.list.records.map((r) => r.resId));
                    }
                    if (group.groups) {
                        collectIds(group.groups);
                    }
                }
            };
            collectIds(list.groups);
            return recordIds;
        }
        // For regular kanban, return IDs of all records
        return list.records.map((record) => record.resId);
    },
});
