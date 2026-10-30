/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {Component, proxy, t, usePlugin, useProps} from "@odoo/owl";
import {AccordionItem} from "@web/core/dropdown/accordion_item";
import {DebugModePlugin} from "@web/core/debug_mode_plugin";
import {_t} from "@web/core/l10n/translation";

export class DropdownItemCustomMeasure extends Component {
    static template = "web_pivot_computed_measure.DropdownItemCustomMeasure";
    static components = {AccordionItem};
    props = useProps({
        measures: t.object(),
        // Passed as model because this module can be extended to be used on
        // other views that use measures, like the graph view.
        model: t.object(),
    });

    setup() {
        this.debugMode = usePlugin(DebugModePlugin);
        const fields = this.availableMeasures;
        this.state = proxy({
            field1: fields[0] || "",
            field2: fields[0] || "",
            operationKey: "sum",
            customOperation: "",
            name: "",
            format: "float",
        });
    }

    get isDebug() {
        return this.debugMode.isActive();
    }

    get availableMeasures() {
        return Object.keys(this.props.measures).filter(
            (measure) => measure !== "__count"
        );
    }

    get operations() {
        return [
            {key: "sum", value: "m1+m2", label: _t("Sum (m1 + m2)")},
            {key: "sub", value: "m1-m2", label: _t("Sub (m1 - m2)")},
            {key: "mult", value: "m1*m2", label: _t("Mult (m1 * m2)")},
            {key: "div", value: "m1/m2", label: _t("Div (m1 / m2)"), format: "float"},
            // Same formula as "div": the percentage format does the * 100
            {
                key: "perc",
                value: "m1/m2",
                label: _t("Perc (m1 * 100 / m2)"),
                format: "percentage",
            },
        ];
    }

    onChangeOperation(ev) {
        // Read the option key, not the select value: "div" and "perc" share
        // the same value, so the value alone can't tell which one was picked.
        const key = ev.target.selectedOptions[0]?.dataset.key;
        this.state.operationKey = key;
        const operation = this.operations.find((op) => op.key === key);
        if (operation?.format) {
            this.state.format = operation.format;
        }
    }

    addMeasure() {
        const {field1, field2, name, format, operationKey} = this.state;
        const operation =
            operationKey === "custom"
                ? this.state.customOperation.trim()
                : this.operations.find((op) => op.key === operationKey)?.value;
        if (!field1 || !field2 || !operation) {
            return;
        }
        return this.props.model.addComputedMeasure(
            Date.now(),
            field1,
            field2,
            operation,
            name.trim(),
            format
        );
    }
}
