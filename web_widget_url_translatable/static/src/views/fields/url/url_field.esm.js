/** @odoo-module **/
import {TranslationButton} from "@web/views/fields/translation_button";
import {UrlField} from "@web/views/fields/url/url_field";
import {patch} from "@web/core/utils/patch";

patch(UrlField, "translatable.UrlField", {
    components: {
        ...UrlField.components,
        TranslationButton,
    },
    props: {
        ...UrlField.props,
        isTranslatable: {type: Boolean, optional: true},
    },
    extractProps: ({field}) => {
        return {
            isTranslatable: field.translate,
        };
    },
});
