import {CharField} from "@web/views/fields/char/char_field";
import {UrlField, formUrlField} from "@web/views/fields/url/url_field";
import {EmailField, formEmailField} from "@web/views/fields/email/email_field";
import {PhoneField, formPhoneField} from "@web/views/fields/phone/phone_field";
import {patch} from "@web/core/utils/patch";

import {Field} from "@web/views/fields/field";

// 1. Patch the global Field component to ALWAYS pass maxLength if options.size is present AND the component supports it
patch(Field.prototype, {
    get fieldComponentProps() {
        const props = super.fieldComponentProps;
        const fieldInfo = this.props.fieldInfo;

        if (fieldInfo && fieldInfo.options && fieldInfo.options.size !== undefined) {
            // Handle cases where the component doesn't define props or inherits them
            const ComponentClass = this.field && this.field.component;
            if (ComponentClass) {
                // If it's one of our patched components, it should support maxLength
                // In Owl, props could be inherited or undefined (meaning all props allowed).
                // If it's explicitly defined and missing maxLength, we skip. Otherwise we inject.
                const propsDef = ComponentClass.props;
                if (!propsDef || "maxLength" in propsDef) {
                    props.maxLength = fieldInfo.options.size;
                }
            }
        }
        return props;
    },
});

// 2. Patch individual components to accept maxLength prop and enforce it on DOM
function patchFieldProps(FieldComponent) {
    if (FieldComponent) {
        // Ensure maxLength prop is allowed by Owl
        FieldComponent.props = {
            ...FieldComponent.props,
            maxLength: {type: Number, optional: true},
        };

        // Add getter to prototype
        patch(FieldComponent.prototype, {
            get maxLength() {
                return this.props.maxLength || super.maxLength;
            },
        });
    }
}

// 3. Patch all standard text-based fields
patchFieldProps(CharField);
patchFieldProps(UrlField);
patchFieldProps(formUrlField.component);
patchFieldProps(EmailField);
patchFieldProps(formEmailField.component);
patchFieldProps(PhoneField);
patchFieldProps(formPhoneField.component);
