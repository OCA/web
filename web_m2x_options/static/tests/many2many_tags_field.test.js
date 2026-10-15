/**
 * Copyright 2026 Tecnativa - Carlos Lopez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */
import {
    COLOR_OPTIONS,
    FIRST_OPTION,
    defineM2xModels,
    mountPartnerForm,
    searchInField,
} from "./m2x_test_helpers.esm";
import {describe, expect, test} from "@odoo/hoot";
import {session} from "@web/session";

describe.current.tags("desktop");

defineM2xModels();

const INPUT = ".o_field_many2many_tags input";
const mountTags = (options) => mountPartnerForm("tag_ids", options, "many2many_tags");

test("create system parameter hides the create option", async () => {
    session.web_m2x_options = {"web_m2x_options.create": "False"};
    await mountTags();
    await searchInField(INPUT, "Unknown");
    expect(".o_m2o_dropdown_option_create").toHaveCount(0);
});

test("search limit option is applied", async () => {
    await mountTags("{'limit': 1}");
    await searchInField(INPUT, "Tag");
    expect(".dropdown-menu li:not(.o_m2o_dropdown_option)").toHaveCount(1);
});

test("create system parameter limit 3 option", async () => {
    session.web_m2x_options = {"web_m2x_options.limit": 3};
    await mountTags();
    await searchInField(INPUT, "Tag");
    expect(".dropdown-menu li:not(.o_m2o_dropdown_option)").toHaveCount(3);
});

test("field_color colors the autocomplete options", async () => {
    await mountTags(COLOR_OPTIONS);
    await searchInField(INPUT, "Tag 1");
    expect(FIRST_OPTION).toHaveAttribute("style", "color: red;");
});
