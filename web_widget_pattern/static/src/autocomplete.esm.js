/** @odoo-module **/

import {AutoComplete} from "@web/core/autocomplete/autocomplete";

const _extractProps = AutoComplete.extractProps;
AutoComplete.extractProps = ({attrs, field}) => {
    return Object.assign(_extractProps({attrs, field}), {
        pattern: attrs.pattern || field.pattern,
    });
};

AutoComplete.props = {
    ...AutoComplete.props,
    pattern: {type: String, optional: true},
};
