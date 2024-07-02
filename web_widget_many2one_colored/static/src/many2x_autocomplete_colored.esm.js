/** @odoo-module */

import {AutoCompleteColored} from "./autocomplete_colored.esm";
import {Many2XAutocomplete} from "@web/views/fields/relational_utils";

export class Many2XAutocompleteColored extends Many2XAutocomplete {
    get optionsSource() {
        return {
            ...super.optionsSource,
            optionTemplate: "web_widget_many2one_colored.AutoCompleteColoredOption",
        };
    }

    async loadOptionsSource(request) {
        const result = await super.loadOptionsSource(request);
        const ids = [];
        const idToIndex = {};
        for (let i = 0; i < result.length; ++i) {
            const option = result[i];
            if (option.value === undefined) {
                break;
            }
            ids.push(option.value);
            idToIndex[option.value] = i;
        }
        const records = await this.orm.read(this.props.resModel, ids, [
            this.props.colorField,
        ]);
        for (const record of records) {
            result[idToIndex[record.id]].color = record[this.props.colorField];
        }
        return result;
    }
}

Many2XAutocompleteColored.template =
    "web_widget_many2one_colored.Many2XAutocompleteColored";
Many2XAutocompleteColored.components = {
    AutoCompleteColored,
};
