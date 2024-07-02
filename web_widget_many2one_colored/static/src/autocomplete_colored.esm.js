/** @odoo-module */

import {AutoComplete} from "@web/core/autocomplete/autocomplete";

const NO_COLOR = 0;

export class AutoCompleteColored extends AutoComplete {
    async onInput() {
        // Unset color as soon as the value is edited, as it does not
        // correspond to a selected choice.
        this.props.color = NO_COLOR;
        return super.onInput();
    }
}

AutoCompleteColored.template = "web_widget_many2one_colored.AutoCompleteColored";
AutoCompleteColored.props = {
    ...AutoComplete.props,
    color: {type: Number},
};
