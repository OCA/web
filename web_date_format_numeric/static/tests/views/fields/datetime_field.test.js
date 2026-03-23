// Copyright 2026 Camptocamp SA
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {
    defineModels,
    fields,
    models,
    mountView,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {expect, test} from "@odoo/hoot";
import {mockTimeZone} from "@odoo/hoot-mock";
import {session} from "@web/session";

class Partner extends models.Model {
    date = fields.Date();
    datetime = fields.Datetime();
    _records = [{id: 1, date: "2025-12-31", datetime: "2025-12-31 10:00:00"}];
}

class User extends models.Model {
    _name = "res.users";
    has_group() {
        return true;
    }
}

defineModels([Partner, User]);

test("date field: session.use_date_format_numeric=true renders numeric format", async () => {
    patchWithCleanup(session, {use_date_format_numeric: true});
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><field name="date" readonly="1"/></form>`,
    });
    expect(".o_field_date span").toHaveText("12/31/2025");
});

test("date field: session.use_date_format_numeric=false renders locale format", async () => {
    patchWithCleanup(session, {use_date_format_numeric: false});
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><field name="date" readonly="1"/></form>`,
    });
    expect(".o_field_date span").toHaveText("Dec 31, 2025");
});

test("date field: options.numeric=false overrides session.use_date_format_numeric=true", async () => {
    patchWithCleanup(session, {use_date_format_numeric: true});
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><field name="date" options="{'numeric': false}" readonly="1"/></form>`,
    });
    expect(".o_field_date span").toHaveText("Dec 31, 2025");
});

test("datetime field: session.use_date_format_numeric=true renders numeric format", async () => {
    mockTimeZone(0);
    patchWithCleanup(session, {use_date_format_numeric: true});
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><field name="datetime" readonly="1"/></form>`,
    });
    expect(".o_field_datetime span").toHaveText("12/31/2025 10:00:00");
});
