/** @odoo-module **/

import {FormController} from "@web/views/form/form_controller";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {onWillUnmount} from "@odoo/owl";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";

// Patch the standard FormController to react on bus notifications
patch(FormController.prototype, "web_refresh_from_backend.FormController", {
    setup() {
        // Call original setup logic
        this._super(...arguments);

        // Get core services used by this behavior
        this.busService = useService("bus_service");
        this.actionService = useService("action");
        this.notificationService = useService("notification");

        // Timestamp of last local save (used to avoid immediate auto-refresh)
        this._lastLocalSave = null;

        // Bind the handler to keep reference for cleanup
        this._boundBusHandler = this._onBusNotification.bind(this);

        // Subscribe to bus notifications
        this.busService.addEventListener("notification", this._boundBusHandler);

        // Cleanup subscription on component unmount
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
     * Listens for notifications with type "web.refresh_view" and delegates
     * processing to _handleViewRefresh.
     *
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
     * Handle view refresh notification.
     *
     * Only refreshes when:
     *  - model matches current form model
     *  - requested view types include "form" (if specified)
     *  - record id matches current record (if specified)
     *
     * @param {Object} notification - Notification payload
     */
    async _handleViewRefresh(notification) {
        const {model, view_types = [], rec_ids = []} = notification;

        // Check if the model matches current form model
        if (this.props.resModel !== model) {
            return;
        }

        // Check if view_type matches (if specified in notification)
        if (view_types.length > 0 && !view_types.includes("form")) {
            return;
        }

        // Check if record ID matches (if rec_ids is specified)
        const currentResId = this.model && this.model.root && this.model.root.resId;
        if (rec_ids.length > 0 && (!currentResId || !rec_ids.includes(currentResId))) {
            return;
        }

        // Skip refresh when form is in a dialog or when a wizard is on top of the stack.
        // Refreshing in that context can leave wizard/confirmation dialogs stuck open
        // (e.g. confirm="..." in wizard view).
        if (this.env.inDialog) {
            return;
        }
        const currentController = this.actionService.currentController;
        const currentAction = currentController && currentController.action;
        if (currentAction && currentAction.target === "new") {
            return;
        }

        await this.refreshForm();
    },

    /**
     * Refresh the form with actual data from server.
     *
     * For normal forms:
     *  - if record is clean: perform a soft_reload action
     *  - if record has unsaved changes: ask for confirmation, then reload
     *
     * For wizards (dialogs, target="new"):
     *  - reload only the current record without full action reload
     *
     * @returns {Promise<void>}
     */
    async refreshForm() {
        // Do not refresh immediately after an explicit save (debounce window)
        if (this._lastLocalSave && Date.now() - this._lastLocalSave < 1000) {
            return;
        }

        if (!this.model || !this.model.root) {
            return;
        }

        // Check if this form is opened as a wizard (dialog)
        const currentController = this.actionService.currentController;
        const action = currentController && currentController.action;
        const isWizard = action && action.target === "new";

        const record = this.model.root;

        if (!isWizard && record.isDirty) {
            // Ask user whether to discard unsaved changes before refreshing
            const confirmed = await new Promise((resolve) => {
                this.dialogService.add(ConfirmationDialog, {
                    title: this.env._t("Form is being refreshed from backend"),
                    body: this.env._t("All unsaved changes will be lost! Continue?"),
                    confirm: () => resolve(true),
                    cancel: () => resolve(false),
                    confirmLabel: this.env._t("Continue"),
                    cancelLabel: this.env._t("Cancel"),
                });
            });

            if (!confirmed) {
                return;
            }
        }

        try {
            await record.load();
        } catch (error) {
            const message =
                (error && error.data && error.data.message) ||
                (error && error.message) ||
                String(error);
            this.notificationService.add(
                this.env._t("Could not reload form. ") + message,
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
     * Override of save button handler.
     *
     * Stores timestamp of last local save to avoid immediate auto-refresh
     * triggered by our own changes.
     */
    async saveButtonClicked() {
        this._lastLocalSave = Date.now();
        return await this._super(...arguments);
    },
});
