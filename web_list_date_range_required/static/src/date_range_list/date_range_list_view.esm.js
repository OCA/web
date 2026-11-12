/** @odoo-module **/
/* Copyright 2026 Heligrafics Fotogrametria S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {
    DEFAULT_DATE_RANGE,
    DateRangeDialog,
    getRangeDates,
} from "../date_range_dialog/date_range_dialog.esm";
import {
    deserializeDate,
    deserializeDateTime,
    serializeDate,
    serializeDateTime,
} from "@web/core/l10n/dates";
import {onMounted, useState} from "@odoo/owl";
import {DateRangeSearchModel} from "./date_range_search_model.esm";
import {ListArchParser} from "@web/views/list/list_arch_parser";
import {ListController} from "@web/views/list/list_controller";
import {_t} from "@web/core/l10n/translation";
import {listView} from "@web/views/list/list_view";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";

/**
 * Reads the range field from the `<field>` whose options have a `date_range` key:
 * `options="{'date_range': True}"` or `options="{'date_range': {'max_days': 90}}"`.
 */
export class DateRangeListArchParser extends ListArchParser {
    parse(xmlDoc, models, modelName) {
        const archInfo = super.parse(...arguments);
        const fieldNode = Object.values(archInfo.fieldNodes).find(
            (node) => node.options.date_range
        );
        if (!fieldNode || !["date", "datetime"].includes(fieldNode.type)) {
            throw new Error(
                `The "date_range_list" view of ${modelName} needs a date or datetime field with options="{'date_range': True}"`
            );
        }
        archInfo.dateRangeField = fieldNode.name;
        archInfo.dateRangeFieldType = fieldNode.type;
        const maxDays = fieldNode.options.date_range.max_days;
        if (maxDays !== undefined) {
            if (!Number.isInteger(maxDays) || maxDays <= 0) {
                throw new Error(
                    `"max_days" of the date range of ${modelName} must be a positive integer`
                );
            }
            archInfo.dateRangeMaxDays = maxDays;
        }
        return archInfo;
    }
}

export class DateRangeListController extends ListController {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const {dateRangeFieldType} = this.archInfo;
        this.serialize =
            dateRangeFieldType === "date" ? serializeDate : serializeDateTime;
        this.deserialize =
            dateRangeFieldType === "date" ? deserializeDate : deserializeDateTime;
        this.dateRange = useState(this.getInitialDateRange());
        onMounted(() => {
            // Opening it in onWillStart blocks the window events: the list is not in the DOM yet
            if (!this.env.searchModel.dateRangeParams) {
                this.openDateRangeDialog();
            }
        });
    }

    getInitialDateRange() {
        const params = this.env.searchModel.dateRangeParams;
        if (params) {
            return {
                dateRange: params.dateRange,
                fromDate: this.deserialize(params.fromDate),
                untilDate: this.deserialize(params.untilDate),
            };
        }
        return {dateRange: DEFAULT_DATE_RANGE, ...getRangeDates(DEFAULT_DATE_RANGE)};
    }

    get dateRangeLabel() {
        const {dateRange, fromDate, untilDate} = this.dateRange;
        switch (dateRange) {
            case "yesterday":
                return _t("Yesterday");
            case "last_7_days":
                return _t("Last 7 Days");
            case "custom": {
                const format = registry
                    .category("formatters")
                    .get(this.archInfo.dateRangeFieldType);
                return `${format(fromDate)} - ${format(untilDate)}`;
            }
            default:
                return _t("Today");
        }
    }

    openDateRangeDialog() {
        const {dateRangeField, dateRangeFieldType, dateRangeMaxDays} = this.archInfo;
        this.dialog.add(DateRangeDialog, {
            ...this.dateRange,
            fieldType: dateRangeFieldType,
            ...(dateRangeMaxDays ? {maxDays: dateRangeMaxDays} : {}),
            save: ({dateRange, fromDate, untilDate}) => {
                Object.assign(this.dateRange, {dateRange, fromDate, untilDate});
                this.env.searchModel.setDateRange({
                    fieldName: dateRangeField,
                    dateRange,
                    fromDate: this.serialize(fromDate),
                    untilDate: this.serialize(untilDate),
                });
            },
        });
    }
}

export const dateRangeListView = {
    ...listView,
    ArchParser: DateRangeListArchParser,
    Controller: DateRangeListController,
    SearchModel: DateRangeSearchModel,
    buttonTemplate: "web_list_date_range_required.DateRangeList.Buttons",
};

registry.category("views").add("date_range_list", dateRangeListView);
