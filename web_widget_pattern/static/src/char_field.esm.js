/** @odoo-module **/

import {CharField} from "@web/views/fields/char/char_field";
import {_lt} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {sprintf} from "@web/core/utils/strings";

patch(CharField.prototype, "web_widget_pattern", {
    parse(value) {
        const result = this._super(...arguments);
        const pattern = this.props.pattern;
        if (pattern) {
            const regex = new RegExp(pattern, "v");
            const match = regex.exec(result);
            if (!match || match[0] !== value) {
                throw new Error(
                    _lt(
                        sprintf("%s does not match required pattern %s", value, pattern)
                    )
                );
            }
        }
        return result;
    },
});

const _extractProps = CharField.extractProps;
CharField.extractProps = ({attrs, field}) => {
    return Object.assign(_extractProps({attrs, field}), {
        pattern: attrs.pattern || field.pattern,
    });
};

CharField.props = {
    ...CharField.props,
    pattern: {type: String, optional: true},
};
