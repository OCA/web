/** @odoo-module **/

import {CharField} from "@web/views/fields/char/char_field";

const _extractProps = CharField.extractProps;
CharField.extractProps = ({attrs, field}) => {
    return Object.assign(_extractProps({attrs, field}), {
        maxLength: field.size || attrs.options.size,
    });
};
