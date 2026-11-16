import {RemainingDaysField} from "@web/views/fields/remaining_days/remaining_days_field";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(RemainingDaysField.prototype, {
    setup() {
        super.setup(...arguments);
        this.disable_remaining_days_rule = session.disable_remaining_days_rule;
    },
    /**
     * @override
     */
    get diffString() {
        /* Check if the remaining days field is disabled for the current model */
        const disable_rules = this.disable_remaining_days_rule;

        // If disable_rules is boolean true, disable for all models
        if (disable_rules === true) {
            return this.formattedValue;
        }
        // Check by models
        if (
            disable_rules && // Check if the config variable exists
            this.props.record.resModel in disable_rules && // Check if the model is in the disable_rules
            typeof disable_rules[this.props.record.resModel].model === "boolean" && // Check if the value is a boolean
            disable_rules[this.props.record.resModel].model === true // Check if the value is true
        ) {
            return this.formattedValue;
        }
        // Check by view types
        if (
            disable_rules && // Check if the config variable exists
            this.props.record.resModel in disable_rules && // Check if the model is in the disable_rules
            typeof disable_rules[this.props.record.resModel].view_types === "object" && // Check if the value is an list
            (disable_rules[this.props.record.resModel].view_types.includes(
                this.env.config.viewType
            ) || // Check if the view type is in the list
                disable_rules[this.props.record.resModel].fields.includes(
                    this.props.name
                )) // Check if the field is in the list
        ) {
            return this.formattedValue;
        }

        return super.diffString;
    },
});
