// Copyright 2026 Camptocamp SA
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {describe, expect, test} from "@odoo/hoot";
import {formatDate} from "@web/views/fields/formatters";
import {patchWithCleanup} from "@web/../tests/web_test_helpers";
import {session} from "@web/session";

describe.current.tags("headless");

test("formatDate.extractOptions defaults to session.use_date_format_numeric", () => {
    patchWithCleanup(session, {use_date_format_numeric: true});
    expect(formatDate.extractOptions({options: {}})).toEqual({numeric: true});

    patchWithCleanup(session, {use_date_format_numeric: false});
    expect(formatDate.extractOptions({options: {}})).toEqual({numeric: false});
});

test("formatDate.extractOptions: options.numeric overrides session.use_date_format_numeric", () => {
    patchWithCleanup(session, {use_date_format_numeric: true});
    expect(formatDate.extractOptions({options: {numeric: "false"}})).toEqual({
        numeric: false,
    });

    patchWithCleanup(session, {use_date_format_numeric: false});
    expect(formatDate.extractOptions({options: {numeric: "true"}})).toEqual({
        numeric: true,
    });
});
