// Copyright 2026 Camptocamp SA
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {dateField, dateRangeField, dateTimeField} from "./datetime_field.esm";
import {ListDateTimeField} from "@web/views/fields/datetime/list_datetime_field";
import {registry} from "@web/core/registry";

registry
    .category("fields")
    .add("list.date", {...dateField, component: ListDateTimeField}, {force: true})
    .add(
        "list.daterange",
        {...dateRangeField, component: ListDateTimeField},
        {force: true}
    )
    .add(
        "list.datetime",
        {...dateTimeField, component: ListDateTimeField},
        {force: true}
    );
