import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {DynamicList} from "@web/model/relational_model/dynamic_list";
import {FormController} from "@web/views/form/form_controller";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

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
    async duplicateRecords(records = []) {
        const superDuplicateRecords = super.duplicateRecords.bind(this, records);
        const resIds = records.length
            ? records.map((r) => r.resId)
            : await this.getResIds(true);
        if (resIds.length > 1) {
            // Core's own `_duplicateRecords` already asks for confirmation
            // when duplicating more than one record; avoid showing it twice.
            return superDuplicateRecords();
        }
        await this.model.dialog.add(ConfirmationDialog, {
            title: _t("Duplicate"),
            body: _t(
                "Are you sure that you would like to duplicate the selected records?"
            ),
            confirm: () => {
                superDuplicateRecords();
            },
            cancel: () => {
                // `ConfirmationDialog` needs this prop to display the cancel
                // button but we do nothing on cancel.
            },
        });
    },
});
