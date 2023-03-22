/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */
import {useBus} from "@web/core/utils/hooks";

const {Component, QWeb} = owl;
const {useState} = owl.hooks;
import * as dates from "@web/search/utils/dates";
const {DateTime} = luxon; // eslint-disable-line no-undef
var ID_CUSTOM_DATE = 0;

/**
 * @extends Component
 */
export class DropdownItemCustomPeriod extends Component {
    setup() {
        this.isOpen = useState({value: false});
        this.type = useState({value: "day"});
        this.quantity = useState({value: 0});
        this.referenceMoment = DateTime.local();
        var fieldsSelected = new Set();
        for (var selected in this.props.comparisonItems) {
            fieldsSelected.add(this.props.comparisonItems[selected].dateFilterId);
        }
        this.fields_selected = Array.from(fieldsSelected);
        this.field = useState({
            value: (this.props.field && this.props.field.id) || this.fields_selected[0],
        });

        useBus(this.env.searchModel, "update", this.render);
    }

    onClickCustomPeriod() {
        this.isOpen.value = !this.isOpen.value;
    }

    onClickAdd() {
        if (this.props.type === "filter") {
            this.addRange();
        } else if (this.props.type === "comparison") {
            this.addComparison();
        }
    }

    addRange() {
        const field_id = this.field.value;
        const key = "custom_" + ID_CUSTOM_DATE++;
        const plusParamID = this.type.value + "s";
        var formatSearch = "";
        switch (this.type.value) {
            case "day":
                formatSearch = "dd MMMM yyyy";
                break;
            case "week":
                formatSearch = "'W'WW yyyy";
                break;
            case "month":
                formatSearch = "MMMM";
                break;
            case "year":
                formatSearch = "yyyy";
                break;
        }
        const periodSearch = {
            [key]: {
                id: key,
                groupNumber: 3,
                description:
                    "Last " + this.quantity.value + " " + this.type.value + "s",
                format: formatSearch,
                plusParam: {[plusParamID]: -this.quantity.value},
                granularity: this.type.value,
                custom_period: {
                    is_custom_period: true,
                    last_period: this.quantity.value,
                },
            },
        };
        Object.assign(dates.PERIOD_OPTIONS, periodSearch);
        this.env.searchModel.optionGenerators = dates.getPeriodOptions(
            this.referenceMoment
        );
        this.env.searchModel.toggleDateFilter(field_id, key);
    }

    addComparison() {
        const key = "custom_" + ID_CUSTOM_DATE++;
        const plusParamID = this.type.value + "s";
        Object.assign(dates.COMPARISON_OPTIONS, {
            [key]: {
                description:
                    "Previous " + this.quantity.value + " " + this.type.value + "s",
                id: key,
                plusParam: {[plusParamID]: -this.quantity.value},
            },
        });
        const comparisonId = this.env.searchModel.nextId;
        this.env.searchModel.searchItems[comparisonId] = {
            comparisonOptionId: key,
            dateFilterId: this.field.value,
            description:
                this.env.searchModel.searchItems[this.field.value].description +
                ": Previous " +
                this.quantity.value +
                " " +
                this.type.value +
                "s",
            groupId: 14,
            id: comparisonId,
            type: "comparison",
        };
        this.env.searchModel.nextId++;
        this.env.searchModel.toggleSearchItem(comparisonId);
    }
}
DropdownItemCustomPeriod.template =
    "web_time_range_menu_custom.DropdownItemCustomPeriod";
DropdownItemCustomPeriod.props = {
    type: {type: String},
    field: {type: Object, optional: true},
    comparisonItems: {type: Object, optional: true},
};
QWeb.registerComponent("DropdownItemCustomPeriod", DropdownItemCustomPeriod);
