import {CharField, charField} from "@web/views/fields/char/char_field";
import {patch} from "@web/core/utils/patch";

// Extract the new prop from field options
const _extractProps = charField.extractProps;
charField.extractProps = ({attrs, options}) => {
    return Object.assign(_extractProps({attrs, options}), {
        maxLength: options.size,
    });
};

// Let the CharField component know that there is a new prop
CharField.props = {
    ...CharField.props,
    maxLength: {type: Number, optional: true},
};

patch(CharField.prototype, {
    get maxLength() {
        return this.props.maxLength || super.maxLength;
    },
});
