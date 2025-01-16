/** @odoo-module **/

import {AutoComplete} from "@web/core/autocomplete/autocomplete";

const _extractProps = AutoComplete.extractProps;
AutoComplete.extractProps = (fieldInfo) => {
    return Object.assign(_extractProps(fieldInfo), {
        pattern: fieldInfo.attrs.pattern || fieldInfo.field.pattern,
    });
};

AutoComplete.props = {
    ...AutoComplete.props,
    pattern: {type: String, optional: true},
};
