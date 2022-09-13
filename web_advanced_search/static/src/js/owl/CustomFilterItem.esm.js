/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {CustomFilterItem} from "@web/search/filter_menu/custom_filter_item";
import {RecordPicker} from "../RecordPicker.esm";

/**
 * Patches the CustomFilterItem for owl widgets.
 *
 * Pivot and Graph views use this new owl widget, so we need to patch it.
 * Other views like Tree use the old legacy widget that will probably dissapear
 * in 16.0. Until then, we need to patch both.
 */
patch(CustomFilterItem.prototype, "web_advanced_search.CustomFilterItem", {
    /**
     * @override
     */
    setup() {
        this._super.apply(this, arguments);
        this.OPERATORS.relational = this.OPERATORS.char;
        this.FIELD_TYPES.many2one = "relational";
    },
    /**
     * @override
     */
    setDefaultValue(condition) {
        const res = this._super.apply(this, arguments);
        const fieldType = this.fields[condition.field].type;
        const genericType = this.FIELD_TYPES[fieldType];
        if (genericType === "relational") {
            condition.value = 0;
            condition.displayedValue = "";
        }
        return res;
    },
    /**
     * Add displayed value to preFilters for "relational" types.
     *
     * @override
     */
    onApply() {
        // To avoid the complete override, we patch this.conditions.map()
        const originalMapFn = this.conditions.map;
        const self = this;
        this.conditions.map = function () {
            const preFilters = originalMapFn.apply(this, arguments);
            for (const condition of this) {
                const field = self.fields[condition.field];
                const type = self.FIELD_TYPES[field.type];
                if (type === "relational") {
                    const idx = this.indexOf(condition);
                    const preFilter = preFilters[idx];
                    const operator = self.OPERATORS[type][condition.operator];
                    const descriptionArray = [
                        field.string,
                        operator.description,
                        `"${condition.displayedValue}"`,
                    ];
                    preFilter.description = descriptionArray.join(" ");
                }
            }
            return preFilters;
        };
        const res = this._super.apply(this, arguments);
        // Restore original map()
        this.conditions.map = originalMapFn;
        return res;
    },
    /**
     * @private
     * @param {Object} condition
     * @param {OwlEvent} ev
     */
    onRelationalChanged(condition, ev) {
        if (ev.detail) {
            condition.value = ev.detail.id;
            condition.displayedValue = ev.detail.display_name;
        }
    },
});

patch(CustomFilterItem, "web_advanced_search.CustomFilterItem", {
    components: {
        ...CustomFilterItem.components,
        RecordPicker,
    },
});

export default CustomFilterItem;
