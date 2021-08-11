odoo.define("web_advanced_search.CustomFilterItem", function (require) {
    "use strict";

    const CustomFilterItem = require("web.CustomFilterItem");
    const FieldMany2One = require("web.relational_fields").FieldMany2One;
    const Relational = require("web_advanced_search.RelationalOwl");
    const {FIELD_TYPES} = require("web.searchUtils");
    const {useListener} = require("web.custom_hooks");

    CustomFilterItem.patch("web_advanced_search.CustomFilterItem", (T) => {
        class AdvancedCustomFilterItem extends T {
            constructor() {
                super(...arguments);
                this.state.field = false;
                this.OPERATORS.relational = this.OPERATORS.char;
                this.FIELD_TYPES.many2one = "relational";
                useListener("m2xchange", this._onM2xDataChanged);
            }

            _addDefaultCondition() {
                super._addDefaultCondition(...arguments);
                const condition = this.state.conditions[
                    this.state.conditions.length - 1
                ];
                condition.index = _.uniqueId("condition_");
            }

            /**
             * @private
             * @param {Object} condition
             */
            _setDefaultValue(condition) {
                const fieldType = this.fields[condition.field].type;
                const genericType = FIELD_TYPES[fieldType];
                if (genericType === "relational") {
                    condition.displayedValue = "";
                } else {
                    super._setDefaultValue(...arguments);
                }
            }

            /**
             * @private
             * @param {Object} condition
             * @param {Event} ev
             */
            _onFieldSelect(condition, ev) {
                super._onFieldSelect(...arguments);
                this.state.field = this.fields[ev.target.selectedIndex];
                this.state.fieldindex = ev.target.selectedIndex;
                this.state.conditionIndex = condition.index;
            }
            /**
             * @private
             * @param {Object} condition
             * @param {Event} ev
             */
            _onOperatorSelect(condition, ev) {
                this.trigger("operatorChange");
                this.state.operator = ev.target[ev.target.selectedIndex].value;
                super._onOperatorSelect(...arguments);
            }
            _onM2xDataChanged(event) {
                const fieldindex = this.fields
                    .map((field) => field.name)
                    .indexOf(event.detail.field);
                const condition = this.state.conditions.filter(
                    (con) =>
                        con.field === fieldindex &&
                        con.index === this.state.conditionIndex
                );
                if (condition.length) {
                    condition[0].value = event.detail.changes.id;
                    condition[0].value = event.detail.changes.display_name;
                }
            }
        }

        return AdvancedCustomFilterItem;
    });
    // Extends HomeMenuWrapper components
    CustomFilterItem.components = Object.assign({}, CustomFilterItem.components, {
        FieldMany2One,
        Relational,
    });
});
