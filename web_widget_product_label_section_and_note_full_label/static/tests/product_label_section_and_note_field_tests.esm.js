/* global QUnit */

import "@web_widget_product_label_section_and_note_full_label/product_label_section_and_note_field/product_label_section_and_note_field.esm";
import {ProductLabelSectionAndNoteField} from "@account/components/product_label_section_and_note_field/product_label_section_and_note_field";

QUnit.module("web_widget_product_label_section_and_note_full_label");

QUnit.test("product label widget shows and stores the full line name", (assert) => {
    const widget = Object.create(ProductLabelSectionAndNoteField.prototype);

    widget.props = {
        name: "product_id",
        record: {
            data: {
                product_id: {
                    display_name: "Test Product",
                },
                name: "Test Product\nCustom description",
                display_type: false,
            },
            evalContext: {
                parent: {
                    state: "draft",
                    locked: false,
                },
            },
        },
    };

    assert.strictEqual(
        widget.label,
        "Test Product\nCustom description",
        "The label should expose the full line name, not strip the product name"
    );

    assert.strictEqual(
        widget.parseLabel("Test Product\nChanged description"),
        "Test Product\nChanged description",
        "Saving the textarea value should keep the full label unchanged"
    );

    assert.strictEqual(
        widget.parseLabel(""),
        "Test Product",
        "Clearing the label should fall back to the product name"
    );
});
