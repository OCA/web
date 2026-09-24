import {patch} from "@web/core/utils/patch";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {_t} from "@web/core/l10n/translation";
import {FormController} from "@web/views/form/form_controller";
import {DynamicList} from "@web/model/relational_model/dynamic_list";

patch(FormController.prototype, {
    async duplicateRecord() {
        await this.dialogService.add(ConfirmationDialog, {
            title: _t("Duplicate"),
            body: _t("Are you sure that you would like to copy this record?"),
            confirm: () => {
                super.duplicateRecord();
            },
            cancel: () => {
                // `ConfirmationDialog` needs this prop to display the cancel
                // button but we do nothing on cancel.
            },
        });
    },
});

patch(DynamicList.prototype, {
    duplicateRecords(records = []) {
        return new Promise((resolve) => {
            this.model.dialog.add(ConfirmationDialog, {
                title: _t("Duplicate"),
                body: _t(
                    "Are you sure that you would like to duplicate the selected records?"
                ),
                confirm: () => {
                    resolve(super.duplicateRecords(records));
                },
                cancel: () => {
                    resolve();
                },
            });
        });
    },
});
