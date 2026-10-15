import {
    Many2XAutocomplete,
    many2XAutocompleteProps,
} from "@web/views/fields/relational_utils";
import {fieldColorProps} from "./standard_field_props.esm";
import {patch} from "@web/core/utils/patch";

patch(many2XAutocompleteProps, {
    ...fieldColorProps,
});

patch(Many2XAutocomplete.prototype, {
    async loadOptionsSource(request) {
        const options = await super.loadOptionsSource(request);
        const {fieldColor, fieldColorOptions, resModel} = this.props;
        if (!fieldColor || !fieldColorOptions || !options.length) {
            return options;
        }
        const recordOptions = options.filter((option) => option.data?.record?.id);
        const valueIds = recordOptions.map((option) => option.data.record.id);
        if (!valueIds.length) {
            return options;
        }
        const records = await this.orm.call(resModel, "search_read", [], {
            domain: [["id", "in", valueIds]],
            fields: [fieldColor],
        });
        const valuesById = new Map(
            records.map((record) => [record.id, record[fieldColor]])
        );
        for (const option of recordOptions) {
            const fieldValue = valuesById.get(option.data.record.id);
            if (fieldValue !== undefined) {
                option.style = `color:${fieldColorOptions[fieldValue] || "black"}`;
            }
        }
        return options;
    },
});
