/** @odoo-module **/

import { charField, CharField } from "@web/views/fields/char/char_field";
import { _t } from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(CharField.prototype, {
    parse(value) {
        const result = super.parse(value);
        const pattern = this.props.pattern;
        if (pattern) {
            const regex = new RegExp(pattern, "v");
            const match = regex.exec(result);
            if (!match || match[0] !== value) {
                throw new Error(
                    _t(`${value} does not match required pattern ${pattern}`)
                );
            }
        }
        return result;
    },
});

const _extractProps = charField.extractProps;
charField.extractProps = (fieldInfo) => {
    return Object.assign(_extractProps(fieldInfo), {
        pattern: fieldInfo.attrs.pattern || fieldInfo.field.pattern,
    });
};

CharField.props = {
    ...CharField.props,
    pattern: {type: String, optional: true},
};
