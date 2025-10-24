/* Copyright 2025 ForgeFlow S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ProductLabelSectionAndNoteField} from "@account/components/product_label_section_and_note_field/product_label_section_and_note_field";
import {patch} from "@web/core/utils/patch";

patch(ProductLabelSectionAndNoteField.prototype, {
    get label() {
        return this.props.record.data.name;
    },
    updateLabel(value) {
        this.props.record.update({name: (!value && this.productName) || value});
    },
});
