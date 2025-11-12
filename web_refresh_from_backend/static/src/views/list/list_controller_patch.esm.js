/** @odoo-module **/

import {ListController} from "@web/views/list/list_controller";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {onWillUnmount} from "@odoo/owl";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";

patch(ListController.prototype, "web_refresh_from_backend.ListController", {
    setup() {
        this._super(...arguments);
        this.busService = useService("bus_service");
        this.dialogService = useService("dialog");
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
        if (
            view_types.length > 0 &&
            !view_types.includes("list") &&
            !view_types.includes("tree")
        ) {
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
     * Refresh the list with actual data from server.
     * If there is an edited record, asks the user to save or cancel.
     *
     * @returns {Promise<void>}
     */
    async refreshList() {
        // Safety check: component might be destroyed
        if (!this.model || !this.model.root) {
            return;
        }

        const list = this.model.root;

        if (list.editedRecord) {
            const confirmed = await new Promise((resolve) => {
                this.dialogService.add(ConfirmationDialog, {
                    title: this.env._t("List is being refreshed from backend"),
                    body: this.env._t(
                        "You have unsaved edits. Save them before refreshing?"
                    ),
                    confirm: () => resolve(true),
                    cancel: () => resolve(false),
                    confirmLabel: this.env._t("Save & Refresh"),
                    cancelLabel: this.env._t("Cancel"),
                });
            });

            if (!confirmed) {
                return;
            }
            try {
                await list.editedRecord.save();
            } catch (error) {
                const message =
                    (error && error.data && error.data.message) ||
                    (error && error.message) ||
                    String(error);
                this.notificationService.add(
                    this.env._t("Could not save record. ") + message,
                    {type: "danger"}
                );
                return;
            }
        }

        // Reload data from server
        try {
            await list.load();
        } catch (error) {
            const message =
                (error && error.data && error.data.message) ||
                (error && error.message) ||
                String(error);
            this.notificationService.add(
                this.env._t("Could not reload list. ") + message,
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
            // For grouped list, collect IDs from all groups
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
        // For regular list, return IDs of all records
        return list.records.map((record) => record.resId);
    },
});
