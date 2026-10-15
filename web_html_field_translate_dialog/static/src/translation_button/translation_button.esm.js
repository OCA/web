/* Copyright 2025 ForgeFlow S.L.
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {HtmlTranslationDialog} from "../html_translation_dialog/html_translation_dialog.esm";
import {Record} from "@web/model/relational_model/record";
import {TranslationButton} from "@web/views/fields/translation_button";
import {patch} from "@web/core/utils/patch";
import {useOwnedDialogs} from "@web/core/utils/hooks";

patch(TranslationButton.prototype, {
    setup() {
        super.setup();
        this.addDialog = useOwnedDialogs();
    },

    get isHtmlField() {
        return this.props.record.fields[this.props.fieldName].type === "html";
    },

    async onClick() {
        // Keep the standard term-by-term dialog for char/text fields; only HTML
        // fields get the per-language rich-text dialog.
        if (!this.isHtmlField) {
            return super.onClick(...arguments);
        }
        const {fieldName, record} = this.props;
        // In a DynamicList the model root is the list itself, not a Record.
        const saved =
            record.model.root instanceof Record
                ? await record.model.root.save()
                : await record.save();
        if (!saved) {
            return;
        }
        this.addDialog(HtmlTranslationDialog, {
            fieldName: fieldName,
            fieldString: record.fields[fieldName].string,
            resId: record.resId,
            resModel: record.resModel,
            onSave: async () => {
                await record.load();
            },
        });
    },
});
