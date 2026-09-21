/** @odoo-module **/

import {PhoneField} from "@web/views/fields/phone/phone_field";
import {WhatsAppWebButton} from "@web_phone_field_whatsapp/components/whatsapp_web_button/whatsapp_web_button.esm";
import {patch} from "@web/core/utils/patch";

patch(PhoneField, "web_phone_field_whatsapp.PhoneField", {
    components: {
        ...PhoneField.components,
        WhatsAppWebButton,
    },
    defaultProps: {
        ...PhoneField.defaultProps,
        enableButton: true,
    },
    props: {
        ...PhoneField.props,
        enableButton: {type: Boolean, optional: true},
    },
    extractProps: ({attrs}) => {
        return {
            enableButton: attrs.options.enable_whatsapp_web,
            placeholder: attrs.placeholder,
        };
    },
});
