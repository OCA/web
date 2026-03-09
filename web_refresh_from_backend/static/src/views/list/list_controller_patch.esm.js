/** @odoo-module **/

import {ListController} from "@web/views/list/list_controller";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {onWillUnmount} from "@odoo/owl";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {_t} from "@web/core/l10n/translation";

patch(ListController.prototype, {
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
     * Handle bus notification for view refresh.
     *
     * @param {Event} event - Bus notification event
     */
    async _onBusNotification({detail: notifications}) {
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
     * Handle view refresh notification.
     *
     * @param {Object} notification - Notification payload
     */
    async _handleViewRefresh(notification) {
        const {model, view_types = [], rec_ids = []} = notification;

        if (this.props.resModel !== model) {
            return;
        }

        if (
            view_types.length > 0 &&
            !view_types.includes("list") &&
            !view_types.includes("tree")
        ) {
            return;
        }

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
        if (!this.model || !this.model.root) {
            return;
        }

        const list = this.model.root;

        if (list.editedRecord) {
            const confirmed = await new Promise((resolve) => {
                this.dialogService.add(ConfirmationDialog, {
                    title: _t("List is being refreshed from backend"),
                    body: _t("You have unsaved edits. Save them before refreshing?"),
                    confirm: () => resolve(true),
                    cancel: () => resolve(false),
                    confirmLabel: _t("Save & Refresh"),
                    cancelLabel: _t("Cancel"),
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
                this.notificationService.add(_t("Could not save record. ") + message, {
                    type: "danger",
                });
                return;
            }
        }

        try {
            await list.load();
        } catch (error) {
            const message =
                (error && error.data && error.data.message) ||
                (error && error.message) ||
                String(error);
            this.notificationService.add(_t("Could not reload list. ") + message, {
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
