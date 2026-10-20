/**
 * Copyright 2026 Tecnativa - Carlos Lopez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */
import {beforeEach, describe, expect, test} from "@odoo/hoot";
import {m2x_options_props} from "@web_m2x_options/utils.esm";
import {patchWithCleanup} from "@web/../tests/web_test_helpers";
import {session} from "@web/session";

describe.current.tags("headless");

beforeEach(() => {
    patchWithCleanup(session, {web_m2x_options: {}});
});

const baseProps = () => ({
    canQuickCreate: true,
    canCreateEdit: true,
    canOpen: true,
    searchLimit: 7,
});

test("system parameters disable create, create_edit and open", () => {
    session.web_m2x_options = {
        "web_m2x_options.create": "False",
        "web_m2x_options.create_edit": "False",
        "web_m2x_options.open": "False",
    };
    const props = m2x_options_props(baseProps(), {}, {});
    expect(props.canQuickCreate).toBe(false);
    expect(props.canCreateEdit).toBe(false);
    expect(props.canOpen).toBe(false);
});

test("field options override the defaults", () => {
    const props = m2x_options_props(
        baseProps(),
        {},
        {no_create: true, no_open: true, limit: 5}
    );
    expect(props.canQuickCreate).toBe(false);
    expect(props.canCreateEdit).toBe(false);
    expect(props.canOpen).toBe(true);
    expect(props.searchLimit).toBe(4);
});

test("system parameter sets the search limit", () => {
    session.web_m2x_options = {"web_m2x_options.limit": "10"};
    const props = m2x_options_props(baseProps(), {}, {});
    expect(props.searchLimit).toBe(9);
});

test("field color options are forwarded", () => {
    const colors = {a: "red"};
    const props = m2x_options_props(baseProps(), {}, {field_color: "state", colors});
    expect(props.fieldColor).toBe("state");
    expect(props.fieldColorOptions).toEqual(colors);
});
