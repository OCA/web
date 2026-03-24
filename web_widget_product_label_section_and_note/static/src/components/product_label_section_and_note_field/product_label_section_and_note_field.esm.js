/** @odoo-module **/
/* Copyright Odoo S.A.
 * Copyright 2024 Tecnativa - Carlos Lopez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {Component, useEffect, useRef, useState} from "@odoo/owl";
import {AutoComplete} from "@web/core/autocomplete/autocomplete";
import {Many2OneField, many2OneField} from "@web/views/fields/many2one/many2one_field";
import {Many2XAutocomplete} from "@web/views/fields/relational_utils";
import {
    SectionAndNoteListRenderer,
    sectionAndNoteFieldOne2Many,
} from "@account/components/section_and_note_fields_backend/section_and_note_fields_backend";
import {X2ManyField, x2ManyField} from "@web/views/fields/x2many/x2many_field";
import {useRecordObserver} from "@web/model/relational_model/utils";
import {getActiveHotkey} from "@web/core/hotkeys/hotkey_service";
import {registry} from "@web/core/registry";
import {useAutofocus} from "@web/core/utils/hooks";
import {useProductAndLabelAutoresize} from "../../core/utils/product_and_label_autoresize.esm";

export function useIsNote(record) {
    return record.data.display_type === "line_note";
}

export function useIsSection(record) {
    return record.data.display_type === "line_section";
}

export class ProductLabelSectionAndNoteListRender extends SectionAndNoteListRenderer {
    setup() {
        this.productColumns = ["product_id", "product_template_id"];
        // We need to store the titleField in a temporary variable
        // because the titleField is set in the parent setup method
        // and the function getActiveColumns is called before the setup method in the account module
        this.titleField_tmp = "";
        super.setup();
        if (this.titleField_tmp) {
            this.titleField = this.titleField_tmp;
        }
    }

    getCellTitle(column, record) {
        // When using this list renderer, we don't want the product_id cell to have a tooltip with its label.
        if (this.productColumns.includes(column.name)) {
            return;
        }
        super.getCellTitle(column, record);
    }

    getActiveColumns(list) {
        let activeColumns = super.getActiveColumns(list);
        const productCol = activeColumns.find((col) =>
            this.productColumns.includes(col.name)
        );
        const labelCol = activeColumns.find((col) => col.name === "name");

        if (productCol) {
            if (labelCol) {
                list.records.forEach(
                    (record) => (record.columnIsProductAndLabel = true)
                );
            } else {
                list.records.forEach(
                    (record) => (record.columnIsProductAndLabel = false)
                );
            }
            activeColumns = activeColumns.filter((col) => col.name !== "name");
            this.titleField_tmp = productCol.name;
        } else {
            this.titleField_tmp = "name";
        }

        return activeColumns;
    }
}

export class ProductLabelSectionAndNoteOne2Many extends X2ManyField {
    static components = {
        ...X2ManyField.components,
        ListRenderer: ProductLabelSectionAndNoteListRender,
    };
}

export const productLabelSectionAndNoteOne2Many = {
    ...x2ManyField,
    component: ProductLabelSectionAndNoteOne2Many,
    additionalClasses: sectionAndNoteFieldOne2Many.additionalClasses,
};
registry
    .category("fields")
    .add(
        "product_label_section_and_note_field_o2m",
        productLabelSectionAndNoteOne2Many
    );

export class ProductLabelSectionAndNoteAutocomplete extends AutoComplete {
    setup() {
        super.setup();
        this.labelTextarea = useRef("labelNodeRef");
    }
    onInputKeydown(event) {
        super.onInputKeydown(event);
        const hotkey = getActiveHotkey(event);
        const labelVisibilityButton = document.getElementById(
            "labelVisibilityButtonId"
        );
        if (hotkey === "enter") {
            if (labelVisibilityButton && !this.labelTextarea.el) {
                labelVisibilityButton.click();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }
}

export class ProductLabelSectionAndNoteFieldAutocomplete extends Many2XAutocomplete {
    static components = {
        ...Many2XAutocomplete.components,
        AutoComplete: ProductLabelSectionAndNoteAutocomplete,
    };
}

export class ProductLabel extends Component {
    static props = {
        field_name: {type: String},
        record: {type: Object},
        label: {type: Function},
        updateLabel: {type: Function},
        readonly: {type: Boolean, optional: true},
    };
    static template = "web_widget_product_label_section_and_note.ProductLabel";
    setup() {
        super.setup();
        this.labelNode = useAutofocus({refName: "labelNodeRef"});
        useProductAndLabelAutoresize(this.labelNode, {
            targetParentName: this.props.field_name,
        });
    }
    get sectionAndNoteClasses() {
        if (useIsSection(this.props.record)) {
            return "fw-bold";
        } else if (useIsNote(this.props.record)) {
            return "fst-italic";
        }
        return "";
    }
    get label() {
        return this.props.label();
    }
    updateLabel(value) {
        if (this.props.updateLabel) {
            this.props.updateLabel(value);
        }
    }
}

export class ProductLabelVisibilityButton extends Component {
    static props = {
        label: {type: Function},
        switchLabelVisibility: {type: Function},
        switchProductVisibility: {type: Function},
        isProductVisible: {type: Boolean, optional: true},
    };
    static template =
        "web_widget_product_label_section_and_note.ProductLabelVisibilityButton";
    get label() {
        return this.props.label();
    }
    switchLabelVisibility() {
        this.props.switchLabelVisibility();
    }
    switchProductVisibility() {
        this.props.switchProductVisibility();
    }
}

export class ProductLabelSectionAndNoteField extends Many2OneField {
    static components = {
        ...Many2OneField.components,
        Many2XAutocomplete: ProductLabelSectionAndNoteFieldAutocomplete,
        ProductLabel: ProductLabel,
        ProductLabelVisibilityButton: ProductLabelVisibilityButton,
    };
    static template =
        "web_widget_product_label_section_and_note.ProductLabelSectionAndNoteField";
    setup() {
        super.setup();
        this.labelVisibility = useState({value: false});
        this.isProductVisible = useState({value: false});
        this.changeProductVisibility = true;
        this.columnIsProductAndLabel = useState({
            value: this.props.record.columnIsProductAndLabel,
        });

        useEffect(
            () => {
                this.columnIsProductAndLabel.value =
                    this.props.record.columnIsProductAndLabel;
            },
            () => [this.props.record.columnIsProductAndLabel]
        );

        useRecordObserver(async (record) => {
            if (this.changeProductVisibility) {
                const label = record.data.name || "";
                this.isProductVisible.value = label.includes(this.productName);
            }
        });
    }

    get productName() {
        return this.props.record.data[this.props.name][1];
    }

    get label() {
        let label = this.props.record.data.name || "";
        if (label.includes(this.productName)) {
            label = label.replace(this.productName, "");
            if (label.includes("\n")) {
                label = label.replace("\n", "");
            }
        }
        return label;
    }

    get isSectionOrNote() {
        return useIsSection(this.props.record) || useIsNote(this.props.record);
    }

    switchLabelVisibility() {
        this.labelVisibility.value = !this.labelVisibility.value;
    }

    switchProductVisibility() {
        let new_name = "";
        if (this.isProductVisible.value && this.productName) {
            new_name = this.label;
        } else {
            new_name = this.productName + "\n" + this.label;
        }
        this.props.record.update({name: new_name});
        this.isProductVisible.value = !this.isProductVisible.value;
    }

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
    }
}

export const productLabelSectionAndNoteField = {
    ...many2OneField,
    component: ProductLabelSectionAndNoteField,
};
registry
    .category("fields")
    .add("product_label_section_and_note_field", productLabelSectionAndNoteField);

// Patch HTMLElement to set a max width on the product and label field cells.
// Odoo does not facilitate inheritance in the function computeColumnWidthsFromContent,
// so we need to patch the getBoundingClientRect method to enforce a max width.
const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
HTMLElement.prototype.getBoundingClientRect = function () {
    const rect = originalGetBoundingClientRect.call(this);
    if (
        this.classList &&
        this.classList.contains("o_product_label_section_and_note_field_cell")
    ) {
        return {
            ...rect,
            width: Math.min(rect.width, 400), // Set your desired max width here
        };
    }
    return rect;
};
