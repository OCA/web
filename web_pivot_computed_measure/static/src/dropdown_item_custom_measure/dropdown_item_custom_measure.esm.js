/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {Component, useState} from "@odoo/owl";

/**
 * @extends Component
 */
export class DropdownItemCustomMeasure extends Component {
    setup() {
        this.isOpen = useState({value: false});
    }

    onClickComputedMeasure() {
        this.isOpen.value = !this.isOpen.value;
    }

    addMeasure(ev) {
        const $target = $(ev.target).closest("#add_computed_measure_wrapper");
        const id = new Date().getTime();
        const field1 = $target.find("#computed_measure_field_1").val();
        const field2 = $target.find("#computed_measure_field_2").val();
        let operation = $target.find("#computed_measure_operation").val();
        if (operation === "custom") {
            operation = $target.find("#computed_measure_operation_custom").val();
        }
        const name = $target.find("#computed_measure_name").val();
        const format = $target.find("#computed_measure_format").val();
        this.props.model.addComputedMeasure(
            id,
            field1,
            field2,
            operation,
            name,
            format
        );
        // Click on measures button to close the modal and recompute the measures added
        $(ev.target).closest(".dropdown").find(".dropdown-toggle").trigger("click");
    }
}
DropdownItemCustomMeasure.template =
    "web_pivot_computed_measure.DropdownItemCustomMeasure";
DropdownItemCustomMeasure.props = {
    measures: Object,
    // Set as model because this module can be extended to be used on views that
    // uses Measures like the graph view.
    model: Object,
};
