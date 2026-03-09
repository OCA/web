/** @odoo-module **/

import {FormController} from "@web/views/form/form_controller";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {onWillUnmount} from "@odoo/owl";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {_t} from "@web/core/l10n/translation";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);

        this.busService = useService("bus_service");
        this.notificationService = useService("notification");

        this._lastLocalSave = null;

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
            await this.refreshForm();
        }
    },

    /**
     * Check whether a refresh notification is relevant to this form.
     *
     * Returns true when all of the following hold:
     *  - model matches current form model
     *  - requested view types include "form" (or none specified)
     *  - record id matches current record (or none specified)
     *  - form is not inside a dialog / wizard
     *
     * @param {Object} payload - Notification payload
     * @returns {Boolean}
     */
    _shouldRefreshView(payload) {
        const {model, view_types = [], rec_ids = []} = payload;

        if (this.props.resModel !== model) {
            return false;
        }
        if (view_types.length > 0 && !view_types.includes("form")) {
            return false;
        }
        const currentResId = this.model && this.model.root && this.model.root.resId;
        if (rec_ids.length > 0 && (!currentResId || !rec_ids.includes(currentResId))) {
            return false;
        }
        // Skip refresh when form is in a dialog or when a wizard is on top
        // of the stack. Refreshing in that context can leave wizard/confirmation
        // dialogs stuck open (e.g. confirm="..." in wizard view).
        if (this.env.inDialog) {
            return false;
        }
        const currentController = this.actionService.currentController;
        const currentAction = currentController && currentController.action;
        if (currentAction && currentAction.target === "new") {
            return false;
        }
        return true;
    },

    /**
     * Refresh the form with actual data from server.
     *
     * For normal forms:
     *  - if record is clean: reload data
     *  - if record has unsaved changes: ask for confirmation, then reload
     *
     * For wizards (dialogs, target="new"):
     *  - reload only the current record without full action reload
     *
     * @returns {Promise<void>}
     */
    async refreshForm() {
        if (this._lastLocalSave && Date.now() - this._lastLocalSave < 1000) {
            return;
        }

        if (!this.model || !this.model.root) {
            return;
        }

        const currentController = this.actionService.currentController;
        const action = currentController && currentController.action;
        const isWizard = action && action.target === "new";

        const record = this.model.root;

        if (!isWizard && record.isDirty) {
            const confirmed = await new Promise((resolve) => {
                this.dialogService.add(ConfirmationDialog, {
                    title: _t("Form is being refreshed from backend"),
                    body: _t("All unsaved changes will be lost! Continue?"),
                    confirm: () => resolve(true),
                    cancel: () => resolve(false),
                    confirmLabel: _t("Continue"),
                    cancelLabel: _t("Cancel"),
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
            this.notificationService.add(_t("Could not reload form. ") + message, {
                type: "danger",
            });
            return;
        }

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
    async saveButtonClicked(params) {
        this._lastLocalSave = Date.now();
        return await super.saveButtonClicked(params);
    },
});
