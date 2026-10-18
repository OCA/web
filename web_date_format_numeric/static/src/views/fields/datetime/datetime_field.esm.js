// Copyright 2026 Camptocamp SA
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {exprToBoolean} from "@web/core/utils/strings";
import {session} from "@web/session";
import {
    dateField as _dateField,
    dateRangeField as _dateRangeField,
    dateTimeField as _dateTimeField,
} from "@web/views/fields/datetime/datetime_field";

// Switch the numeric option from "selection" to "boolean"
const numericOption = _dateField.supportedOptions.find((o) => o.name === "numeric");
if (numericOption) {
    numericOption.label = _t("Use Numeric Date Format");
    numericOption.type = "boolean";
    delete numericOption.choices;
    delete numericOption.placeholder;
}

const useDateFormatNumeric = (baseField) => {
    const _extractProps = baseField.extractProps;
    return {
        ...baseField,
        extractProps: (fieldInfo, dynamicInfo) => ({
            ..._extractProps(fieldInfo, dynamicInfo),
            numeric: exprToBoolean(
                fieldInfo.options?.numeric ?? session.use_date_format_numeric
            ),
        }),
    };
};

export const dateField = useDateFormatNumeric(_dateField);
export const dateTimeField = useDateFormatNumeric(_dateTimeField);
export const dateRangeField = useDateFormatNumeric(_dateRangeField);

registry
    .category("fields")
    .add("date", dateField, {force: true})
    .add("datetime", dateTimeField, {force: true})
    .add("daterange", dateRangeField, {force: true});
