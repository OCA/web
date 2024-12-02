/** @odoo-module **/
/* Copyright Odoo S.A.
 * Copyright 2024 Tecnativa - Carlos Lopez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {
    onMounted,
    onPatched,
    onWillUnmount,
    onWillUpdateProps,
    useEffect,
    useRef,
    useState,
} from "@odoo/owl";
import {AutoComplete} from "@web/core/autocomplete/autocomplete";
import {Many2OneField} from "@web/views/fields/many2one/many2one_field";
import {Many2XAutocomplete} from "@web/views/fields/relational_utils";
import {SectionAndNoteListRenderer} from "@account/components/section_and_note_fields_backend/section_and_note_fields_backend";
import {X2ManyField} from "@web/views/fields/x2many/x2many_field";
import {_t} from "@web/core/l10n/translation";
import {getActiveHotkey} from "@web/core/hotkeys/hotkey_service";
import {registry} from "@web/core/registry";

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

export class ProductLabelSectionAndNoteOne2Many extends X2ManyField {}
ProductLabelSectionAndNoteOne2Many.components = {
    ...X2ManyField.components,
    ListRenderer: ProductLabelSectionAndNoteListRender,
};
ProductLabelSectionAndNoteOne2Many.additionalClasses =
    SectionAndNoteListRenderer.additionalClasses;

registry
    .category("fields")
    .add(
        "product_label_section_and_note_field_o2m",
        ProductLabelSectionAndNoteOne2Many
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
    setup() {
        super.setup();
        this.input = useRef("section_and_note_input");
    }

    get isSectionOrNote() {
        return this.props.isSection || this.props.isNote;
    }

    get isSection() {
        return this.props.isSection;
    }
}

ProductLabelSectionAndNoteFieldAutocomplete.components = {
    ...Many2XAutocomplete.components,
    AutoComplete: ProductLabelSectionAndNoteAutocomplete,
};
ProductLabelSectionAndNoteFieldAutocomplete.template =
    "web_widget_product_label_section_and_note.ProductLabelSectionAndNoteFieldAutocomplete";

export class ProductLabelSectionAndNoteField extends Many2OneField {
    setup() {
        super.setup();
        this.isPrintMode = useState({value: false});
        this.labelVisibility = useState({value: false});
        this.isProductVisible = useState({value: false});
        this.switchToLabel = false;
        this.columnIsProductAndLabel = useState({
            value: this.props.record.columnIsProductAndLabel,
        });
        this.labelNode = useRef("labelNodeRef");
        this.productNode = useRef("productNodeRef");

        useEffect(
            () => {
                this.columnIsProductAndLabel.value =
                    this.props.record.columnIsProductAndLabel;
            },
            () => [this.props.record.columnIsProductAndLabel]
        );

        onPatched(() => {
            if (this.labelNode.el && this.switchToLabel) {
                this.switchToLabel = false;
                this.labelNode.el.focus();
            }
        });

        this.onBeforePrint = () => {
            this.isPrintMode.value = true;
        };

        this.onAfterPrint = () => {
            this.isPrintMode.value = false;
        };

        // The following hooks are used to make a div visible only in the print view. This div is necessary in the
        // print view in order not to have scroll bars but can't be displayed in the normal view because it adds
        // an empty line. This is done by switching an attribute to true only during the print view life cycle and
        // including the said div in a t-if depending on that attribute.
        onMounted(() => {
            window.addEventListener("beforeprint", this.onBeforePrint);
            window.addEventListener("afterprint", this.onAfterPrint);
        });

        onWillUnmount(() => {
            window.removeEventListener("beforeprint", this.onBeforePrint);
            window.removeEventListener("afterprint", this.onAfterPrint);
        });
        onWillUpdateProps((newProps) => {
            const label = newProps.record.data.name || "";
            this.isProductVisible.value = label.includes(this.productName);
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

    get Many2XAutocompleteProps() {
        const props = super.Many2XAutocompleteProps;
        props.isSection = this.isSection(this.props.record);
        props.isNote = this.isNote(this.props.record);
        props.placeholder = _t("Search a product");
        props.updateLabel = this.updateLabel.bind(this);
        return props;
    }

    get isProductClickable() {
        return this.props.record.evalContext.parent.state !== "draft";
    }

    get isSectionOrNote() {
        return this.isSection(this.props.record) || this.isNote(this.props.record);
    }

    get sectionAndNoteClasses() {
        if (this.isSection()) {
            return "fw-bold";
        } else if (this.isNote()) {
            return "fst-italic";
        }
        return "";
    }

    isSection(record = null) {
        record = record || this.props.record;
        return record.data.display_type === "line_section";
    }

    isNote(record = null) {
        record = record || this.props.record;
        return record.data.display_type === "line_note";
    }

    switchLabelVisibility() {
        this.labelVisibility.value = !this.labelVisibility.value;
        this.switchToLabel = true;
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
        this.props.record.update({
            name:
                this.productName && this.productName !== value
                    ? `${this.productName}\n${value}`
                    : value,
        });
    }
}

ProductLabelSectionAndNoteField.components = {
    ...Many2OneField.components,
    Many2XAutocomplete: ProductLabelSectionAndNoteFieldAutocomplete,
};
ProductLabelSectionAndNoteField.template =
    "web_widget_product_label_section_and_note.ProductLabelSectionAndNoteField";

registry
    .category("fields")
    .add("product_label_section_and_note_field", ProductLabelSectionAndNoteField);
