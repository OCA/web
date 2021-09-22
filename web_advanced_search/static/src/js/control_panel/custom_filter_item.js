odoo.define("web_advanced_search.CustomFilterItem", function (require) {
    "use strict";

    const CustomFilterItem = require("web.CustomFilterItem");
    const FieldMany2One = require("web.relational_fields").FieldMany2One;
    const Relational = require("web_advanced_search.RelationalOwl");
    const {FIELD_TYPES} = require("web.searchUtils");
    const {useListener} = require("web.custom_hooks");
    const Domain = require("web.Domain");
    const field_utils = require("web.field_utils");

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
                    condition[0].displayedValue = event.detail.changes.display_name;
                }
            }
            _onApply() {
                /* Patch onApply to add displayedValue to discriptionArray */
                const preFilters = this.state.conditions.map((condition) => {
                    const field = this.fields[condition.field];
                    const type = this.FIELD_TYPES[field.type];
                    const operator = this.OPERATORS[type][condition.operator];
                    const descriptionArray = [field.string, operator.description];
                    const domainArray = [];
                    let domainValue = [];
                    // Field type specifics
                    if ("value" in operator) {
                        domainValue = [operator.value];
                        // No description to push here
                    } else if (["date", "datetime"].includes(type)) {
                        domainValue = condition.value.map((val) =>
                            field_utils.parse[type](val, {type}, {timezone: true})
                        );
                        const dateValue = condition.value.map((val) =>
                            field_utils.format[type](val, {type}, {timezone: false})
                        );
                        descriptionArray.push(
                            `"${dateValue.join(" " + this.env._t("and") + " ")}"`
                        );
                    } else {
                        domainValue = [condition.value];
                        descriptionArray.push(
                            `"${condition.displayedValue || condition.value}"`
                        );
                    }
                    // Operator specifics
                    if (operator.symbol === "between") {
                        domainArray.push(
                            [field.name, ">=", domainValue[0]],
                            [field.name, "<=", domainValue[1]]
                        );
                    } else {
                        domainArray.push([field.name, operator.symbol, domainValue[0]]);
                    }
                    const preFilter = {
                        description: descriptionArray.join(" "),
                        domain: Domain.prototype.arrayToString(domainArray),
                        type: "filter",
                    };
                    return preFilter;
                });

                this.model.dispatch("createNewFilters", preFilters);

                // Reset state
                this.state.open = false;
                this.state.conditions = [];
                this._addDefaultCondition();
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
