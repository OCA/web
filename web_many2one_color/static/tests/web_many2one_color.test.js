// Copyright 2026 glueckkanja AG
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

// Apply the patches under test (side-effect import).
import "@web_many2one_color/many2one_color.esm";

import {beforeEach, describe, expect, test} from "@odoo/hoot";
import {
    clickFieldDropdown,
    clickFieldDropdownItem,
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
    patchWithCleanup,
    webModels,
} from "@web/../tests/web_test_helpers";
import {animationFrame} from "@odoo/hoot-mock";
import {session} from "@web/session";

const COLOR_FIELD_NAME = "many2one_color";
const COLOR_SPEC = {display_name: {}, many2one_color: {}, many2one_color_message: {}};
const PLAIN_SPEC = {display_name: {}};
const ROOT = ".o_field_widget[name=partner_id] .o_many2one";

class Partner extends models.Model {
    _name = "partner";

    name = fields.Char();
    many2one_color = fields.Selection({
        selection: [
            ["warning", "Warning"],
            ["critical", "Critical"],
        ],
    });
    many2one_color_message = fields.Text();

    _records = [
        {id: 1, name: "Plain"},
        {
            id: 2,
            name: "Warn",
            many2one_color: "warning",
            many2one_color_message: "Late payer",
        },
        {
            id: 3,
            name: "Crit",
            many2one_color: "critical",
            many2one_color_message: "Blocked",
        },
    ];
}

class Team extends models.Model {
    _name = "team";

    name = fields.Char();

    _records = [{id: 1, name: "Team A"}];
}

class Line extends models.Model {
    _name = "line";

    name = fields.Char();
    partner_id = fields.Many2one({relation: "partner"});
    team_id = fields.Many2one({relation: "team"});

    _records = [{id: 1, name: "Line 1", partner_id: 3, team_id: 1}];
}

defineModels({...webModels, Partner, Team, Line});

describe.current.tags("desktop");

beforeEach(() => {
    patchWithCleanup(session, {many2one_color_models: ["partner"]});
});

async function mountLineForm(fieldAttrs = "") {
    return mountView({
        type: "form",
        resModel: "line",
        resId: 1,
        arch: `<form><field name="partner_id" ${fieldAttrs}/><field name="team_id"/></form>`,
    });
}

describe("web_many2one_color", () => {
    test("requests the color fields and colors the value in edit mode", async () => {
        onRpc("web_read", ({kwargs}) => {
            expect.step("web_read");
            expect(kwargs.specification.partner_id.fields).toEqual(COLOR_SPEC);
            expect(kwargs.specification.team_id.fields).toEqual(PLAIN_SPEC);
        });
        await mountLineForm();
        expect.verifySteps(["web_read"]);
        expect(ROOT).toHaveClass("text-danger");
        expect(`${ROOT} .o_field_many2one_selection`).toHaveAttribute(
            "data-tooltip",
            "Blocked"
        );
        expect(".o_field_widget[name=team_id] .o_many2one").not.toHaveClass(
            "text-danger"
        );
    });

    test("colors the link and shows the message in readonly mode", async () => {
        await mountLineForm('readonly="1"');
        expect(`${ROOT} a.o_form_uri`).toHaveClass("text-danger");
        expect(`${ROOT} a.o_form_uri`).toHaveAttribute("data-tooltip", "Blocked");
    });

    test("the no_color option disables the feature", async () => {
        onRpc("web_read", ({kwargs}) => {
            expect(kwargs.specification.partner_id.fields).toEqual(PLAIN_SPEC);
        });
        onRpc("web_name_search", ({kwargs}) => {
            expect.step("web_name_search");
            expect(kwargs.specification).toEqual(PLAIN_SPEC);
        });
        await mountLineForm(`options="{'no_color': True}"`);
        expect(ROOT).not.toHaveClass("text-danger");
        expect(`${ROOT} .o_field_many2one_selection`).not.toHaveAttribute(
            "data-tooltip"
        );
        await clickFieldDropdown("partner_id");
        expect.verifySteps(["web_name_search"]);
        expect(".o-autocomplete--dropdown-item:contains(Warn)").not.toHaveClass(
            "text-warning"
        );
        expect(".o-autocomplete--dropdown-item:contains(Crit)").not.toHaveClass(
            "text-danger"
        );
    });

    test("the no_color option applies to each node of a duplicated field", async () => {
        onRpc("web_read", ({kwargs}) => {
            // The color data is requested once for both nodes of the field.
            expect(kwargs.specification.partner_id.fields).toEqual(COLOR_SPEC);
        });
        onRpc("web_name_search", ({kwargs}) => {
            expect.step(
                COLOR_FIELD_NAME in kwargs.specification
                    ? "web_name_search with color"
                    : "web_name_search plain"
            );
        });
        await mountView({
            type: "form",
            resModel: "line",
            resId: 1,
            arch: `<form>
                <field name="partner_id" options="{'no_color': True}"/>
                <field name="partner_id"/>
            </form>`,
        });
        const plain = ".o_field_widget[name=partner_id]:eq(0) .o_many2one";
        const colored = ".o_field_widget[name=partner_id]:eq(1) .o_many2one";
        expect(plain).not.toHaveClass("text-danger");
        expect(`${plain} .o_field_many2one_selection`).not.toHaveAttribute(
            "data-tooltip"
        );
        expect(colored).toHaveClass("text-danger");
        expect(`${colored} .o_field_many2one_selection`).toHaveAttribute(
            "data-tooltip",
            "Blocked"
        );
        await contains(`${plain} input`).click();
        expect.verifySteps(["web_name_search plain"]);
        expect(".o-autocomplete--dropdown-item:contains(Crit)").not.toHaveClass(
            "text-danger"
        );
        await contains(`${colored} input`).click();
        expect.verifySteps(["web_name_search with color"]);
        expect(".o-autocomplete--dropdown-item:contains(Crit)").toHaveClass(
            "text-danger"
        );
    });

    test("the no_color option applies to each column of a duplicated field", async () => {
        await mountView({
            type: "list",
            resModel: "line",
            arch: `<list>
                <field name="partner_id" options="{'no_color': True}"/>
                <field name="partner_id"/>
            </list>`,
        });
        const plain = ".o_data_row:first .o_data_cell[name=partner_id]:eq(0)";
        const colored = ".o_data_row:first .o_data_cell[name=partner_id]:eq(1)";
        expect(plain).not.toHaveClass("text-danger");
        // The cell keeps the default tooltip of the list renderer.
        expect(plain).not.toHaveAttribute("data-tooltip", "Blocked");
        expect(colored).toHaveClass("text-danger");
        expect(colored).toHaveAttribute("data-tooltip", "Blocked");
    });

    test("the no_color option applies to each node of a duplicated kanban field", async () => {
        await mountView({
            type: "kanban",
            resModel: "line",
            arch: `<kanban><templates><t t-name="card">
                <div class="plain"><field name="partner_id" options="{'no_color': True}"/></div>
                <div class="colored"><field name="partner_id"/></div>
            </t></templates></kanban>`,
        });
        const plain = ".o_kanban_record .plain span:contains(Crit)";
        const colored = ".o_kanban_record .colored span:contains(Crit)";
        expect(plain).not.toHaveClass("text-danger");
        expect(plain).not.toHaveAttribute("data-tooltip");
        expect(colored).toHaveClass("text-danger");
        expect(colored).toHaveAttribute("data-tooltip", "Blocked");
    });

    test("models without color state are left untouched", async () => {
        patchWithCleanup(session, {many2one_color_models: []});
        onRpc("web_read", ({kwargs}) => {
            expect(kwargs.specification.partner_id.fields).toEqual(PLAIN_SPEC);
        });
        await mountLineForm();
        expect(ROOT).not.toHaveClass("text-danger");
    });

    test("colors readonly cells in list views", async () => {
        await mountView({
            type: "list",
            resModel: "line",
            arch: `<list><field name="partner_id"/></list>`,
        });
        expect(".o_data_row:first .o_data_cell[name=partner_id]").toHaveClass(
            "text-danger"
        );
        expect(".o_data_row:first .o_data_cell[name=partner_id]").toHaveAttribute(
            "data-tooltip",
            "Blocked"
        );
    });

    test("colors values in kanban cards", async () => {
        await mountView({
            type: "kanban",
            resModel: "line",
            arch: `<kanban><templates><t t-name="card"><field name="partner_id"/></t></templates></kanban>`,
        });
        expect(".o_kanban_record span:contains(Crit)").toHaveClass("text-danger");
        expect(".o_kanban_record span:contains(Crit)").toHaveAttribute(
            "data-tooltip",
            "Blocked"
        );
    });

    test("colors matching entries in the dropdown", async () => {
        onRpc("web_name_search", ({kwargs}) => {
            expect.step("web_name_search");
            expect(kwargs.specification).toEqual(COLOR_SPEC);
        });
        await mountLineForm();
        await clickFieldDropdown("partner_id");
        expect.verifySteps(["web_name_search"]);
        expect(".o-autocomplete--dropdown-item:contains(Warn)").toHaveClass(
            "text-warning"
        );
        expect(".o-autocomplete--dropdown-item:contains(Crit)").toHaveClass(
            "text-danger"
        );
        expect(".o-autocomplete--dropdown-item:contains(Plain)").not.toHaveClass(
            "text-warning"
        );
        expect(".o-autocomplete--dropdown-item:contains(Plain)").not.toHaveClass(
            "text-danger"
        );
    });

    test("selecting a record updates the color without an extra read", async () => {
        onRpc("web_read", () => expect.step("web_read"));
        await mountLineForm();
        expect.verifySteps(["web_read"]);
        await clickFieldDropdown("partner_id");
        await clickFieldDropdownItem("partner_id", "Warn");
        expect(ROOT).toHaveClass("text-warning");
        expect(ROOT).not.toHaveClass("text-danger");
        expect(`${ROOT} .o_field_many2one_selection`).toHaveAttribute(
            "data-tooltip",
            "Late payer"
        );
        await clickFieldDropdown("partner_id");
        await clickFieldDropdownItem("partner_id", "Plain");
        expect(ROOT).not.toHaveClass("text-warning");
        expect(ROOT).not.toHaveClass("text-danger");
        expect(`${ROOT} .o_field_many2one_selection`).not.toHaveAttribute(
            "data-tooltip"
        );
        expect.verifySteps([]);
    });

    test("a value without color data is completed with a read", async () => {
        onRpc("web_name_search", ({parent}) =>
            parent().map(({id, display_name}) => ({id, display_name}))
        );
        onRpc("web_read", ({model, args, kwargs}) => {
            if (model === "partner") {
                expect.step(`partner web_read ${args[0]}`);
                expect(kwargs.specification).toEqual(COLOR_SPEC);
            }
        });
        await mountLineForm();
        await clickFieldDropdown("partner_id");
        await clickFieldDropdownItem("partner_id", "Warn");
        await animationFrame();
        expect.verifySteps(["partner web_read 2"]);
        expect(ROOT).toHaveClass("text-warning");
    });

    test("re-selecting the same record refreshes its color", async () => {
        onRpc("web_name_search", ({parent}) =>
            parent().map(({id, display_name}) => ({id, display_name}))
        );
        onRpc("web_read", ({model, args, kwargs}) => {
            if (model === "partner") {
                expect.step(`partner web_read ${args[0]}`);
                expect(kwargs.specification).toEqual(COLOR_SPEC);
                return [
                    {
                        id: 3,
                        display_name: "Crit",
                        many2one_color: "warning",
                        many2one_color_message: "Now a warning",
                    },
                ];
            }
            return undefined;
        });
        await mountLineForm();
        expect(ROOT).toHaveClass("text-danger");
        await clickFieldDropdown("partner_id");
        await clickFieldDropdownItem("partner_id", "Crit");
        await animationFrame();
        expect.verifySteps(["partner web_read 3"]);
        expect(ROOT).toHaveClass("text-warning");
        expect(ROOT).not.toHaveClass("text-danger");
        expect(`${ROOT} .o_field_many2one_selection`).toHaveAttribute(
            "data-tooltip",
            "Now a warning"
        );
    });
});
