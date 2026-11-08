/** @odoo-module **/

import {_t} from "@web/core/l10n/translation";
import {Many2XAutocomplete} from "@web/views/fields/relational_utils";

export class CustomMany2XAutocomplete extends Many2XAutocomplete {
    async loadOptionsSource(request) {
        const res = await super.loadOptionsSource(request);
        if (this.props.value) {
            const inputVal = this.autoCompleteContainer.el.querySelector("input").value;
            const record = await this.orm.call(this.props.resModel, "name_search", [], {
                name: this.props.value,
                operator: "ilike",
                args: [],
                limit: 1,
                context: this.props.context,
            });
            res.push({
                label: _t(`Edit ${record[0][1]}`),
                classList: "o_m2o_dropdown_option o_m2o_dropdown_option_create_edit",
                action: () =>
                    this._updateRecord(this.props.resModel, record[0], inputVal),
            });
        }
        return res;
    }
    async _updateRecord(model, record, changes) {
        return await this.orm.write(model, [record[0]], {name: changes});
    }
}
