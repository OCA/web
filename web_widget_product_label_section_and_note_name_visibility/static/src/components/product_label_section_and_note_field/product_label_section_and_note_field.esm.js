/* Copyright Odoo S.A.
 * Copyright 2025 Tecnativa - Carlos Lopez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ProductLabelSectionAndNoteField} from "@account/components/product_label_section_and_note_field/product_label_section_and_note_field";
import {patch} from "@web/core/utils/patch";
import {useRecordObserver} from "@web/model/relational_model/utils";
import {useState} from "@odoo/owl";

patch(ProductLabelSectionAndNoteField.prototype, {
    setup() {
        super.setup(...arguments);
        this.isProductVisible = useState({value: false});
        this.changeProductVisibility = true;
        useRecordObserver(async (record) => {
            if (this.changeProductVisibility) {
                const label = record.data.name || "";
                this.isProductVisible.value = label.includes(this.productName);
            }
        });
    },
    switchProductVisibility() {
        let new_name = "";
        if (this.isProductVisible.value && this.productName) {
            new_name = this.label;
        } else {
            new_name = this.productName + "\n" + this.label;
        }
        this.props.record.update({name: new_name});
        this.isProductVisible.value = !this.isProductVisible.value;
    },
    updateLabel(value) {
        this.changeProductVisibility = false;
        this.props.record.update({
            name:
                this.productName &&
                this.productName !== value &&
                this.isProductVisible.value
                    ? `${this.productName}\n${value}`
                    : value,
        });
    },
});
