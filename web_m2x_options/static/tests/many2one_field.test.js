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

const INPUT = ".o_field_many2one input";
const mountM2o = (options) => mountPartnerForm("partner_id", options);

test("open system parameter hides the external button", async () => {
    session.web_m2x_options = {"web_m2x_options.open": "False"};
    await mountM2o();
    expect(".o_field_widget[name=partner_id] .o_external_button").toHaveCount(0);
});

test("create system parameter hides the create option", async () => {
    session.web_m2x_options = {"web_m2x_options.create": "False"};
    await mountM2o();
    await searchInField(INPUT, "abc");
    expect(".o_m2o_dropdown_option_create").toHaveCount(0);
});

test("field_color colors the autocomplete options", async () => {
    await mountM2o(COLOR_OPTIONS);
    await searchInField(INPUT, "Tag");
    expect(FIRST_OPTION).toHaveAttribute("style", "color: red;");
});
