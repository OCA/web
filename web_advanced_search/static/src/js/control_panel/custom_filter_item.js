odoo.define("web_advanced_search.CustomFilterItem", function (require) {
    "use strict";

    const CustomFilterItem = require("web.CustomFilterItem");
    const RecordPicker = require("web_advanced_search.RelationalOwl");

    CustomFilterItem.patch("web_advanced_search.CustomFilterItem", (T) => {
        class AdvancedCustomFilterItem extends T {
            constructor() {
                super(...arguments);
                this.OPERATORS.relational = this.OPERATORS.char;
                this.FIELD_TYPES.many2one = "relational";
            }
            /**
             * @private
             * @param {Object} condition
             */
            _setDefaultValue(condition) {
                const res = super._setDefaultValue(...arguments);
                const fieldType = this.fields[condition.field].type;
                const genericType = this.FIELD_TYPES[fieldType];
                if (genericType === "relational") {
                    condition.value = 0;
                    condition.displayedValue = "";
                }
                return res;
            }
            /**
             * @private
             * @param {Object} condition
             * @param {OwlEvent} ev
             */
            _onRelationalChanged(condition, ev) {
                condition.value = ev.detail.id;
                condition.displayedValue = ev.detail.display_name;
            }
            _onApply() {
                // To avoid the complete override, we patch this.conditions.map()
                const originalMapFn = this.state.conditions.map;
                const self = this;
                this.state.conditions.map = function () {
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
                const res = super._onApply(...arguments);
                // Restore original map()
                this.state.conditions.map = originalMapFn;
                return res;
            }
        }

        return AdvancedCustomFilterItem;
    });
    // Extends HomeMenuWrapper components
    CustomFilterItem.components = Object.assign({}, CustomFilterItem.components, {
        RecordPicker,
    });
});
