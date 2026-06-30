import {CharField, charField} from "@web/views/fields/char/char_field";
import {Field} from "@web/views/fields/field";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(CharField.prototype, {
    parse(value) {
        const result = super.parse(...arguments);
        const pattern = this.props.pattern;
        if (result && pattern) {
            const regex = new RegExp(pattern, "v");
            const match = regex.exec(result);
            if (!match || match[0] !== value) {
                throw new Error(
                    _t("%s does not match required pattern %s", value, pattern)
                );
            }
        }
        return result;
    },
});

patch(charField, {
    extractProps(fieldInfo) {
        return Object.assign(super.extractProps(fieldInfo), {
            pattern: fieldInfo.pattern,
        });
    },
});

patch(Field, {
    parseFieldNode(node, models, modelName) {
        const fieldInfo = super.parseFieldNode(...arguments);
        fieldInfo.pattern =
            (node.attributes.pattern && node.attributes.pattern.value) ||
            models[modelName].fields[fieldInfo.name].pattern;
        return fieldInfo;
    },
});

patch(CharField.props, {
    pattern: {type: String, optional: true},
});
