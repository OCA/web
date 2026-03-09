/** @odoo-module **/

import {KanbanController} from "@web/views/kanban/kanban_controller";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {onWillUnmount} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";

patch(KanbanController.prototype, {
    setup() {
        super.setup(...arguments);
        this.busService = useService("bus_service");
        this.notificationService = useService("notification");

        this._boundBusHandler = this._onBusNotification.bind(this);
        this.busService.addEventListener("notification", this._boundBusHandler);

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
     * Handle bus notification batch for view refresh.
     * Coalesces the batch: if any notification matches, refreshes once.
     *
     * @param {Event} event - Bus notification event
     */
    async _onBusNotification({detail: notifications}) {
        if (!this.model || !this.model.root) {
            return;
        }
        const shouldRefresh = notifications.some(
            ({type, payload}) =>
                type === "web.refresh_view" && this._shouldRefreshView(payload)
        );
        if (shouldRefresh) {
            await this.refreshList();
        }
    },

    /**
     * Check whether a refresh notification is relevant to this kanban.
     *
     * Returns true when all of the following hold:
     *  - model matches current kanban model
     *  - requested view types include "kanban" (or none specified)
     *  - at least one loaded record id is in rec_ids (or none specified)
     *
     * @param {Object} payload - Notification payload
     * @returns {Boolean}
     */
    _shouldRefreshView(payload) {
        const {model, view_types = [], rec_ids = []} = payload;

        if (this.props.resModel !== model) {
            return false;
        }
        if (view_types.length > 0 && !view_types.includes("kanban")) {
            return false;
        }
        if (rec_ids.length > 0) {
            const loadedIds = this.getLoadedRecordIds();
            if (!loadedIds.some((id) => rec_ids.includes(id))) {
                return false;
            }
        }
        return true;
    },

    /**
     * Refresh the kanban with actual data from server.
     *
     * @returns {Promise<void>}
     */
    async refreshList() {
        if (!this.model || !this.model.root) {
            return;
        }

        const list = this.model.root;

        try {
            await list.load();
        } catch (error) {
            const message =
                (error && error.data && error.data.message) ||
                (error && error.message) ||
                String(error);
            this.notificationService.add(_t("Could not reload kanban. ") + message, {
                type: "danger",
            });
            return;
        }

        if (this.model && this.model.root) {
            this.render(true);
        }
    },

    /**
     * Get IDs of all loaded records on the current page.
     *
     * @returns {Array<Number>} Array of record IDs
     */
    getLoadedRecordIds() {
        const list = this.model.root;

        if (list.isGrouped) {
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
        return list.records.map((record) => record.resId);
    },
});
