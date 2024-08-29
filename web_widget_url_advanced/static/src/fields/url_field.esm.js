/** @odoo-module **/

/* Copyright 2018 Simone Orsi - Camptocamp SA
License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html). */

import {patch} from "@web/core/utils/patch";
import {UrlField, formUrlField, urlField} from "@web/views/fields/url/url_field";

patch(UrlField.props, {
    text_field: {type: String, optional: true},
    prefix_name: {type: String, optional: true},
});

patch(UrlField.prototype, {
    _get_text_field() {
        if (this.props.text_field) {
            let field_value = this.props.record.data[this.props.text_field];
            if (Array.isArray(field_value) && field_value.length == 2) {
                field_value = field_value[1];
            }
            return field_value;
        }
        return false;
    },

    get title() {
        return (
            this._get_text_field() ||
            this.props.text ||
            this.props.record.data[this.props.name] ||
            ""
        );
    },

    get formattedHrefWithPrefix() {
        let value = this.formattedHref;

        if (this.props.prefix_name) {
            value = this.props.prefix_name + ":" + value;
        }

        return value;
    },
});

const patchExtractProps = {
    extractProps({attrs, options}) {
        const props = super.extractProps(...arguments);
        props.text_field = attrs.text_field || options.text_field;
        props.prefix_name = attrs.prefix_name || options.prefix_name;
        return props;
    },
};

patch(urlField, patchExtractProps);
patch(formUrlField, patchExtractProps);
