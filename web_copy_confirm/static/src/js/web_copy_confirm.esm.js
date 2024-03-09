/** @odoo-module **/

import {patch} from "web.utils";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {_t} from "@web/core/l10n/translation";
import {FormController} from "@web/views/form/form_controller";

patch(FormController.prototype, "DuplicateConfirmation", {
    async duplicateRecord() {
        var _super = this._super;
        await this.dialogService.add(ConfirmationDialog, {
            title: _t("Duplicate"),
            body: _t("Are you sure that you would like to copy this record?"),
            confirm: () => {
                _super.apply(this, arguments);
            },
            cancel: () => {
                // `ConfirmationDialog` needs this prop to display the cancel
                // button but we do nothing on cancel.
            },
        });
    },
});
