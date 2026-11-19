/*
    Copyright 2026 Roberto Fichera
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {Deferred, animationFrame, runAllTimers} from "@odoo/hoot-mock";
import {
    MockServer,
    contains,
    defineActions,
    defineModels,
    defineWebModels,
    fields,
    getService,
    makeServerError,
    models,
    mountView,
    mountWithCleanup,
    onRpc,
    patchWithCleanup,
    switchView,
    toggleMenuItem,
    toggleSearchBarMenu,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {deserializeDate, deserializeDateTime} from "@web/core/l10n/dates";
import {
    listPanelAutoFor,
    setPendingOrigin,
    takePendingOrigin,
} from "@web_form_listpanel/origin.esm";
import {queryAllTexts, queryOne, resize} from "@odoo/hoot-dom";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {ListPanel} from "@web_form_listpanel/list_panel.esm";
import {ListPanelRenderer} from "@web_form_listpanel/list_panel_renderer.esm";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {WebClient} from "@web/webclient/webclient";
import {browser} from "@web/core/browser/browser";
import {onWillRender} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {session} from "@web/session";

describe.current.tags("desktop");

class Country extends models.Model {
    _name = "country";
    name = fields.Char();
    _records = [
        {id: 1, name: "Italy"},
        {id: 2, name: "France"},
    ];
}

class Partner extends models.Model {
    name = fields.Char({string: "Name"});
    country_id = fields.Many2one({string: "Country", relation: "country"});
    dom_list = fields.Json();
    dom_str = fields.Char();
    photo = fields.Binary();
    day = fields.Date({string: "Day"});
    stamp = fields.Datetime({string: "Stamp"});
    country_ids = fields.Many2many({string: "Countries", relation: "country"});
    qty = fields.Integer({string: "Qty"});
    currency_id = fields.Many2one({string: "Currency", relation: "res.currency"});
    amount = fields.Monetary({string: "Amount", currency_field: "currency_id"});
    _records = [
        {
            id: 1,
            name: "p1",
            country_id: 1,
            dom_list: [["id", "in", [1, 2]]],
            day: "2026-11-15",
            stamp: "2026-11-15 09:00:00",
            country_ids: [1, 2],
            qty: 1,
        },
        {id: 2, name: "p2", country_id: 1, dom_str: "[('id', '=', 3)]", qty: 2},
        {id: 3, name: "p3", country_id: 2, qty: 4},
    ];
}

defineWebModels();
defineModels([Country, Partner]);

const sheet = `<sheet><field name="name"/><field name="country_id"/></sheet>`;

describe("placement", () => {
    test("panel is placed before the sheet", async () => {
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `<form><listpanel domain="[]"/>${sheet}</form>`,
        });
        expect(".o_listpanel_container + .o_form_sheet_bg").toHaveCount(1);
    });

    test("panel is laid out on the left of the sheet", async () => {
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `<form><listpanel domain="[]"/>${sheet}</form>`,
        });
        const panel = queryOne(".o_listpanel_container").getBoundingClientRect();
        const sheetBg = queryOne(".o_form_sheet_bg").getBoundingClientRect();
        expect(panel.width).toBeGreaterThan(0);
        expect(panel.right).toBeLessThan(sheetBg.left + 1);
        expect(Math.abs(panel.top - sheetBg.top)).toBeLessThan(2);
    });

    test("form without listpanel is unchanged", async () => {
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `<form>${sheet}</form>`,
        });
        expect(".o_listpanel_container").toHaveCount(0);
    });

    test("hidden in a dialog", async () => {
        Partner._views.form = `<form><listpanel domain="[]"/>${sheet}</form>`;
        await mountWithCleanup(WebClient);
        getService("dialog").add(FormViewDialog, {resModel: "partner", resId: 1});
        await animationFrame();
        expect(".modal .o_form_view").toHaveCount(1);
        expect(".modal .o_listpanel_container").toHaveCount(0);
    });

    test("invisible attribute", async () => {
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `<form><listpanel domain="[]" invisible="name == 'p1'"/>${sheet}</form>`,
        });
        expect(".o_listpanel_container").toHaveCount(0);
    });
});

function mountPanel(panel, resId = 1, extra = "") {
    return mountView({
        type: "form",
        resModel: "partner",
        resId,
        resIds: [1, 2, 3],
        arch: `<form>${panel}<sheet><field name="name"/><field name="country_id"/>${extra}</sheet></form>`,
    });
}

describe("related mode", () => {
    test("default column is display name", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2", "p3"]);
    });

    test("declared columns", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="name"/><field name="country_id"/></listpanel>`
        );
        expect(queryAllTexts(".o_listpanel thead th")).toEqual(["Name", "Country"]);
        expect(queryAllTexts(".o_listpanel_row:first-child td")).toEqual([
            "p1",
            "Italy",
        ]);
    });

    test("related domain uses the record", async () => {
        await mountPanel(`<listpanel domain="[('country_id', '=', country_id)]"/>`);
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2"]);
    });

    test("server-side domain as a list (Binary or Json)", async () => {
        await mountPanel(
            `<listpanel domain="dom_list"/>`,
            1,
            `<field name="dom_list" invisible="1"/>`
        );
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2"]);
    });

    test("an empty server-side domain shows no records", async () => {
        await mountPanel(
            `<listpanel domain="dom_list"/>`,
            3,
            `<field name="dom_list" invisible="1"/>`
        );
        expect(".o_listpanel_empty").toHaveText("No records");
    });

    test("server-side domain as a string (Char)", async () => {
        await mountPanel(
            `<listpanel domain="dom_str"/>`,
            2,
            `<field name="dom_str" invisible="1"/>`
        );
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p3"]);
    });

    test("refetch when the evaluated domain changes", async () => {
        await mountPanel(`<listpanel domain="[('name', '=', name)]"/>`);
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1"]);
        await contains(".o_field_widget[name=name] input").edit("p3");
        await runAllTimers();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p3"]);
    });

    test("rows refresh after a save", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        await contains(".o_field_widget[name=name] input").edit("p1 edited");
        await contains(".o_form_button_save").click();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1 edited", "p2", "p3"]);
    });

    test("dates, datetimes and x2many are formatted", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="day"/><field name="stamp"/><field name="country_ids"/></listpanel>`
        );
        const formatters = registry.category("formatters");
        expect(queryAllTexts(".o_listpanel_row:first-child td")).toEqual([
            formatters.get("date")(deserializeDate("2026-11-15")),
            formatters.get("datetime")(deserializeDateTime("2026-11-15 09:00:00")),
            "2 records",
        ]);
        expect(".o_listpanel_row:first-child td:nth-child(2)").not.toHaveText(
            "2026-11-15 09:00:00"
        );
    });

    test("current record highlighted", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel_current").toHaveText("p1");
    });

    test("title and order", async () => {
        // The Hoot mock server does not apply `order` in web_search_read
        // (orderByField is called with swapped arguments), so check the kwarg.
        onRpc("web_search_read", ({kwargs}) => {
            expect.step(`order:${kwargs.order}`);
        });
        await mountPanel(`<listpanel domain="[]" string="Mates" order="name desc"/>`);
        expect(".o_listpanel_title").toHaveText("Mates");
        expect.verifySteps(["order:name DESC"]);
    });

    test("bad domain shows an error and keeps the form usable", async () => {
        await mountPanel(`<listpanel domain="[('x', '=', not_a_field)]"/>`);
        expect(".o_listpanel_error").toHaveCount(1);
        await contains(".o_field_widget[name=name] input").edit("changed");
        expect(queryOne(".o_field_widget[name=name] input").value).toBe("changed");
    });

    test("rpc failure shows an error and no dialog", async () => {
        onRpc("web_search_read", () => {
            throw makeServerError();
        });
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel_error").toHaveCount(1);
        expect(".modal").toHaveCount(0);
    });

    test("empty set", async () => {
        await mountPanel(`<listpanel domain="[('id', '=', 0)]"/>`);
        expect(".o_listpanel_empty").toHaveText("No records");
    });
});

describe("list attributes", () => {
    test("row decoration", async () => {
        await mountPanel(
            `<listpanel domain="[]" decoration-danger="name == 'p2'"><field name="name"/></listpanel>`
        );
        expect(".o_listpanel_row:eq(1)").toHaveClass("text-danger");
        expect(".o_listpanel_row:eq(0)").not.toHaveClass("text-danger");
    });

    test("cell decoration", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="name" decoration-bf="name == 'p1'"/></listpanel>`
        );
        expect(".o_listpanel_row:eq(0) .o_data_cell").toHaveClass("fw-bold");
        expect(".o_listpanel_row:eq(1) .o_data_cell").not.toHaveClass("fw-bold");
    });

    test("widget renders", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="name"/><field name="country_ids" widget="many2many_tags"/></listpanel>`
        );
        expect(".o_listpanel_row:eq(0) .o_tag").toHaveCount(2);
    });

    test("optional column hidden, toggler shows it", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="name"/><field name="qty" optional="hide"/></listpanel>`
        );
        expect(queryAllTexts(".o_listpanel thead th.o_column_sortable")).toEqual([
            "Name",
        ]);
        await contains(".o_listpanel .o_optional_columns_dropdown button").click();
        await contains(".o-dropdown--menu input[name=qty]").click();
        expect(queryAllTexts(".o_listpanel thead th.o_column_sortable")).toEqual([
            "Name",
            "Qty",
        ]);
    });

    test("column_invisible on the form record", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="name"/><field name="qty" column_invisible="name == 'p1'"/></listpanel>`
        );
        expect(".o_listpanel thead th[data-name=qty]").toHaveCount(0);
        await contains(".o_listpanel_row:eq(1) .o_data_cell:first").click();
        await animationFrame();
        expect(".o_listpanel thead th[data-name=qty]").toHaveCount(1);
    });

    test("sum footer", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="name"/><field name="qty" sum="Total"/></listpanel>`
        );
        expect(".o_listpanel tfoot").toHaveText("7");
    });

    test("header sorts the panel and lasts across a record switch", async () => {
        onRpc("web_search_read", ({kwargs}) => {
            expect.step(`order:${kwargs.order}`);
        });
        await mountPanel(
            `<listpanel domain="[]" order="qty"><field name="name"/></listpanel>`
        );
        expect.verifySteps(["order:qty ASC"]);
        await contains(".o_listpanel thead th[data-name=name]").click();
        await contains(".o_listpanel thead th[data-name=name]").click();
        expect.verifySteps(["order:name ASC, qty ASC", "order:name DESC, qty ASC"]);
        await contains(".o_listpanel_row:eq(1) .o_data_cell:first").click();
        await animationFrame();
        await contains(".o_field_widget[name=name] input").edit("x");
        await contains(".o_form_button_save").click();
        await animationFrame();
        expect.verifySteps(["order:name DESC, qty ASC"]);
    });

    test("expression field not in the panel is loaded", async () => {
        await mountPanel(
            `<listpanel domain="[]" decoration-danger="qty == 2"><field name="name"/></listpanel>`,
            1,
            `<field name="qty"/>`
        );
        expect(".o_listpanel_row:eq(1)").toHaveClass("text-danger");
        expect(".o_listpanel thead th[data-name=qty]").toHaveCount(0);
    });

    test("x2many without widget renders", async () => {
        await mountPanel(
            `<listpanel domain="[]"><field name="name"/><field name="country_ids"><list><field name="name"/></list></field></listpanel>`
        );
        expect(".o_listpanel_row:eq(0) .o_data_cell:eq(1)").toHaveText("2 records");
    });
});

describe("review fixes", () => {
    test("panel field modifiers do not reach the form record", async () => {
        onRpc("web_save", () => expect.step("web_save"));
        await mountPanel(
            `<listpanel domain="[]"><field name="name"/><field name="dom_str" required="1"/></listpanel>`,
            3
        );
        await contains(".o_field_widget[name=name] input").edit("p3 edited");
        await contains(".o_form_button_save").click();
        expect.verifySteps(["web_save"]);
        expect(".o_field_invalid").toHaveCount(0);
    });

    test("the total is not capped", async () => {
        onRpc("web_search_read", ({kwargs}) => {
            expect.step(`count_limit:${kwargs.count_limit ?? "none"}`);
        });
        await mountPanel(`<listpanel domain="[]"/>`);
        expect.verifySteps(["count_limit:none"]);
    });

    test("rows of a pending load are dimmed and do not open", async () => {
        let hold = null;
        onRpc("web_search_read", async () => {
            const current = hold;
            hold = null;
            await current;
        });
        onRpc("web_read", () => expect.step("web_read"));
        await mountPanel(`<listpanel domain="[]"><field name="name"/></listpanel>`);
        expect.verifySteps(["web_read"]);
        const late = new Deferred();
        hold = late;
        await contains(".o_listpanel thead th[data-name=name]").click();
        expect(".o_listpanel_body").toHaveClass("o_listpanel_loading");
        await contains(".o_listpanel_row:nth-child(2) .o_data_cell:first").click();
        await animationFrame();
        expect.verifySteps([]);
        late.resolve();
        await animationFrame();
        expect(".o_listpanel_body").not.toHaveClass("o_listpanel_loading");
    });

    test("a superseded first load settles", async () => {
        const loads = [];
        patchWithCleanup(ListPanel.prototype, {
            load() {
                const result = {settled: false};
                loads.push(result);
                return super.load().finally(() => (result.settled = true));
            },
        });
        let hold = null;
        onRpc("web_search_read", async () => {
            const current = hold;
            hold = null;
            await current;
        });
        patchWithCleanup(browser.localStorage, {
            getItem: (key) => (key.includes(":collapsed:") ? "1" : null),
        });
        await mountPanel(`<listpanel domain="[('name', '!=', name)]"/>`);
        const first = new Deferred();
        hold = first;
        await contains(".o_listpanel_expand").click();
        await contains(".o_field_widget[name=name] input").edit("p2");
        await runAllTimers();
        await animationFrame();
        first.resolve();
        await animationFrame();
        await animationFrame();
        expect(loads.every((load) => load.settled)).toBe(true);
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p3"]);
    });

    test("a monetary column loads its currency", async () => {
        onRpc("web_search_read", ({kwargs}) => {
            expect.step(Object.keys(kwargs.specification).sort().join(","));
        });
        await mountPanel(`<listpanel domain="[]"><field name="amount"/></listpanel>`);
        expect.verifySteps(["amount,currency_id"]);
    });

    test("the auto panel loads only its columns", async () => {
        patchWithCleanup(session, {web_form_listpanel_auto_panel: true});
        Partner._views = {
            list: `<list><field name="name"/><field name="country_id"/><field name="qty"/><field name="day"/><field name="stamp"/></list>`,
            form: `<form><sheet><field name="name"/></sheet></form>`,
            search: `<search/>`,
        };
        defineActions([
            {
                id: 1,
                name: "Partners",
                res_model: "partner",
                type: "ir.actions.act_window",
                views: [
                    [false, "list"],
                    [false, "form"],
                ],
            },
        ]);
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:nth-child(1) td[name=name]").click();
        await animationFrame();
        onRpc("web_search_read", ({kwargs}) => {
            expect.step(Object.keys(kwargs.specification).sort().join(","));
        });
        await contains(".o_control_panel .o_listpanel_auto_toggle").click();
        await animationFrame();
        expect.verifySteps(["country_id,name,qty"]);
    });

    test("a form edit does not re-render the panel's table", async () => {
        const renders = [];
        patchWithCleanup(ListPanelRenderer.prototype, {
            setup() {
                super.setup();
                onWillRender(() => renders.push(1));
            },
        });
        await mountPanel(`<listpanel domain="[]"><field name="name"/></listpanel>`);
        expect(renders.length).toBeGreaterThan(0);
        renders.length = 0;
        await contains(".o_field_widget[name=name] input").edit("p1 edited");
        await animationFrame();
        expect(renders).toEqual([]);
    });

    test("columns shrink to fit the panel", async () => {
        await mountPanel(
            `<listpanel domain="[]">
                <field name="name"/><field name="country_id"/><field name="qty"/>
                <field name="amount"/>
            </listpanel>`
        );
        await animationFrame();
        const renderer = queryOne(".o_listpanel .o_list_renderer");
        const right = renderer.getBoundingClientRect().left + renderer.clientWidth;
        const amount = queryOne(".o_listpanel thead th[data-name=amount]");
        expect(amount.getBoundingClientRect().right).toBeLessThan(right + 1);
    });

    test("a panel declared after the sheet is still placed before it", async () => {
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `<form>${sheet}<listpanel domain="[]"/></form>`,
        });
        expect(".o_listpanel_container + .o_form_sheet_bg").toHaveCount(1);
    });

    test("a column that fails to render does not break the form", async () => {
        patchWithCleanup(console, {warn: (message) => expect.step(message)});
        await mountPanel(
            `<listpanel domain="[]" decoration-danger="parent.name"><field name="name"/></listpanel>`
        );
        expect(".o_listpanel_error").toHaveText("Cannot display the records");
        expect.verifySteps(["listpanel: cannot render the records"]);
        await contains(".o_field_widget[name=name] input").edit("p1 edited");
        expect(".o_field_widget[name=name] input").toHaveValue("p1 edited");
    });
});

describe("navigation", () => {
    test("click loads the record and sets the pager", async () => {
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `<form><listpanel domain="[]"/><sheet><field name="name"/></sheet></form>`,
        });
        await contains(".o_listpanel_row:nth-child(2) .o_data_cell:first").click();
        await animationFrame();
        expect(".o_field_widget[name=name] input").toHaveValue("p2");
        expect(".o_pager_counter").toHaveText("2 / 3");
        expect(".o_listpanel_current").toHaveText("p2");
    });

    test("dirty record is saved first", async () => {
        onRpc(({method}) => {
            if (["web_save", "web_read"].includes(method)) {
                expect.step(method);
            }
        });
        await mountPanel(`<listpanel domain="[]"/>`);
        expect.verifySteps(["web_read"]);
        await contains(".o_field_widget[name=name] input").edit("p1 edited");
        await contains(".o_listpanel_row:nth-child(2) .o_data_cell:first").click();
        await animationFrame();
        expect.verifySteps(["web_save", "web_read"]);
        expect(".o_field_widget[name=name] input").toHaveValue("p2");
    });

    test("failed save keeps the edited record", async () => {
        expect.errors(1);
        onRpc("web_save", () => {
            throw makeServerError();
        });
        await mountPanel(`<listpanel domain="[]"/>`);
        await contains(".o_field_widget[name=name] input").edit("p1 edited");
        await contains(".o_listpanel_row:nth-child(2) .o_data_cell:first").click();
        await animationFrame();
        expect.verifyErrors(["Odoo Server Error"]);
        expect(".o_field_widget[name=name] input").toHaveValue("p1 edited");
    });

    test("a deleted row is dropped with a notification", async () => {
        expect.errors(1);
        await mountPanel(`<listpanel domain="[]"/>`);
        MockServer.env.partner.unlink([2]);
        await contains(".o_listpanel_row:nth-child(2) .o_data_cell:first").click();
        await animationFrame();
        expect.verifyErrors([/cannot be found/]);
        expect(".o_notification").toHaveCount(1);
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p3"]);
        expect(".o_field_widget[name=name] input").toHaveValue("p1");
    });

    test("the current row has a coloured left border", async () => {
        await mountPanel(`<listpanel domain="[]"/>`, 2);
        const bar = (selector) => getComputedStyle(queryOne(selector), "::before");
        expect(bar(".o_listpanel_current td:first-child").width).toBe("3px");
        expect(bar(".o_listpanel_row:first-child td:first-child").content).toBe("none");
    });

    test("current record off the page: no highlight, no jump", async () => {
        await mountPanel(`<listpanel domain="[]" limit="2"/>`, 3);
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2"]);
        expect(".o_listpanel_current").toHaveCount(0);
    });

    test("new record: nothing highlighted, saved before leaving", async () => {
        onRpc("web_save", () => {
            expect.step("web_save");
        });
        await mountPanel(`<listpanel domain="[]"/>`);
        await contains(".o_form_button_create").click();
        expect(".o_listpanel_current").toHaveCount(0);
        await contains(".o_field_widget[name=name] input").edit("new one");
        await contains(".o_listpanel_row:first-child .o_data_cell:first").click();
        await animationFrame();
        expect.verifySteps(["web_save"]);
        expect(".o_field_widget[name=name] input").toHaveValue("p1");
    });
});

describe("panel pager", () => {
    test("pager pages", async () => {
        await mountPanel(`<listpanel domain="[]" limit="2"/>`);
        expect(".o_listpanel .o_pager_counter").toHaveText("1-2 / 3");
        await contains(".o_listpanel .o_pager_next").click();
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p3"]);
    });

    test("editable range", async () => {
        await mountPanel(`<listpanel domain="[]" limit="2"/>`);
        await contains(".o_listpanel .o_pager_value").click();
        await contains(".o_listpanel input.o_pager_value").edit("1-3");
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2", "p3"]);
    });

    test("a new domain goes back to the first page", async () => {
        await mountPanel(`<listpanel domain="[('name', '!=', name)]" limit="1"/>`);
        await contains(".o_listpanel .o_pager_next").click();
        expect(".o_listpanel .o_pager_counter").toHaveText("2 / 2");
        await contains(".o_field_widget[name=name] input").edit("zz");
        await runAllTimers();
        await animationFrame();
        expect(".o_listpanel .o_pager_counter").toHaveText("1 / 3");
    });

    test("a late response does not overwrite a newer one", async () => {
        let hold = null;
        onRpc("web_search_read", async () => {
            const current = hold;
            hold = null;
            await current;
        });
        await mountPanel(`<listpanel domain="[('name', '!=', name)]" limit="1"/>`);
        const late = new Deferred();
        hold = late;
        await contains(".o_listpanel .o_pager_next").click();
        await contains(".o_field_widget[name=name] input").edit("zz");
        await runAllTimers();
        await animationFrame();
        late.resolve();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1"]);
        expect(".o_listpanel .o_pager_counter").toHaveText("1 / 3");
    });

    test("no pager when everything fits", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel .o_pager").toHaveCount(0);
    });
});

describe("search mode", () => {
    function setupAction() {
        Partner._views = {
            list: `<list><field name="name"/><field name="country_id"/></list>`,
            kanban: `<kanban><templates><t t-name="card"><field name="name"/></t></templates></kanban>`,
            form: `<form>
                <listpanel domain="[('country_id', '=', country_id)]"/>
                <sheet>
                    <button name="2" type="action" string="Other action" class="o_other_action"/>
                    <field name="name"/><field name="country_id"/>
                </sheet>
            </form>`,
            search: `<search><filter name="italy" string="Italians" domain="[('country_id', '=', 1)]"/></search>`,
        };
        Country._views = {list: `<list><field name="name"/></list>`};
        defineActions([
            {
                id: 1,
                name: "Partners",
                res_model: "partner",
                type: "ir.actions.act_window",
                views: [
                    [false, "list"],
                    [false, "kanban"],
                    [false, "form"],
                ],
            },
            {
                id: 2,
                name: "Countries",
                res_model: "country",
                type: "ir.actions.act_window",
                views: [[false, "list"]],
            },
        ]);
    }

    function stepPanelFetch() {
        onRpc("web_search_read", ({model, kwargs}) => {
            if (model === "partner" && "display_name" in kwargs.specification) {
                const order = kwargs.order || "-";
                expect.step(
                    `${JSON.stringify(kwargs.domain)}|${order}|${kwargs.offset}`
                );
            }
        });
    }

    test("list to form starts in Search with the list domain, order and page", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await toggleSearchBarMenu();
        await toggleMenuItem("Italians");
        await contains("th[data-name=name]").click();
        await contains("th[data-name=name]").click();
        stepPanelFetch();
        await contains(".o_data_row:nth-child(2) td[name=name]").click();
        await animationFrame();
        expect(".o_listpanel_toggle [data-mode=search]").toHaveClass("active");
        expect.verifySteps(['[["country_id","=",1]]|name DESC|0']);
        expect(".o_listpanel_row").toHaveCount(2);
    });

    test("a mode switch goes back to the mode's order", async () => {
        setupAction();
        Partner._views.form = `<form>
            <listpanel domain="[]" order="qty"><field name="name"/></listpanel>
            <sheet><field name="name"/></sheet>
        </form>`;
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        onRpc("web_search_read", ({model, kwargs}) => {
            if (model === "partner" && !("country_id" in kwargs.specification)) {
                expect.step(kwargs.order);
            }
        });
        await contains(".o_data_row:nth-child(1) td[name=name]").click();
        await animationFrame();
        await contains(".o_listpanel thead th[data-name=name]").click();
        await contains(".o_listpanel_toggle [data-mode=related]").click();
        await contains(".o_listpanel_toggle [data-mode=search]").click();
        expect.verifySteps(["qty ASC", "name ASC, qty ASC", "qty ASC", "qty ASC"]);
    });

    test("the panel opens on the list's page", async () => {
        setupAction();
        Partner._views.list = `<list limit="2"><field name="name"/></list>`;
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_pager_next").click();
        stepPanelFetch();
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        expect.verifySteps(["[]|-|2"]);
        expect(".o_listpanel .o_pager_counter").toHaveText("3-3 / 3");
        expect(".o_listpanel_current").toHaveText("p3");
    });

    test("kanban to form starts in Search", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await switchView("kanban");
        await toggleSearchBarMenu();
        await toggleMenuItem("Italians");
        stepPanelFetch();
        await contains(".o_kanban_record:first-child").click();
        await animationFrame();
        expect(".o_listpanel_toggle [data-mode=search]").toHaveClass("active");
        expect.verifySteps(['[["country_id","=",1]]|-|0']);
    });

    test("Search mode: the form pager moves the highlight only", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        stepPanelFetch();
        await contains(".o_control_panel .o_pager_next").click();
        await animationFrame();
        expect.verifySteps([]);
        expect(".o_listpanel_toggle [data-mode=search]").toHaveClass("active");
        expect(".o_listpanel_current").toHaveText("p2");
    });

    test("Search mode: a new record keeps the rows, nothing highlighted", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        await contains(".o_form_button_create").click();
        await animationFrame();
        expect(".o_listpanel_toggle [data-mode=search]").toHaveClass("active");
        expect(".o_listpanel_row").toHaveCount(3);
        expect(".o_listpanel_current").toHaveCount(0);
    });

    test("toggle back to Related", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:nth-child(3) td[name=name]").click();
        await animationFrame();
        expect(".o_listpanel_row").toHaveCount(3);
        await contains(".o_listpanel_toggle [data-mode=related]").click();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p3"]);
    });

    test("no origin: Search is disabled", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel_toggle [data-mode=search]").toHaveAttribute("disabled");
        expect(".o_listpanel_toggle [data-mode=related]").toHaveClass("active");
    });

    test("an origin is not reused by a later form", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        await contains(".o_back_button, .breadcrumb-item a").click();
        await animationFrame();
        await getService("action").doAction({
            type: "ir.actions.act_window",
            res_model: "partner",
            res_id: 2,
            views: [[false, "form"]],
        });
        await animationFrame();
        expect(".o_listpanel_toggle [data-mode=search]").toHaveAttribute("disabled");
    });

    test("the origin survives a breadcrumb round trip", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        await contains(".o_other_action").click();
        await animationFrame();
        expect(".o_list_view").toHaveCount(1);
        await contains(".breadcrumb-item:nth-child(2) a").click();
        await animationFrame();
        expect(".o_listpanel_toggle [data-mode=search]").toHaveClass("active");
    });

    test("reopening from a changed list takes the new list", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2", "p3"]);
        await contains(".o_back_button, .breadcrumb-item a").click();
        await animationFrame();
        await toggleSearchBarMenu();
        await toggleMenuItem("Italians");
        await contains(".o_data_row:nth-child(2) td[name=name]").click();
        await animationFrame();
        expect(".o_field_widget[name=name] input").toHaveValue("p2");
        expect(".o_listpanel_toggle [data-mode=search]").toHaveClass("active");
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2"]);
    });

    function openPartnerForm(resId) {
        return getService("action").doAction({
            type: "ir.actions.act_window",
            res_model: "partner",
            res_id: resId,
            views: [[false, "form"]],
        });
    }

    test("a list in a dialog leaves no origin behind", async () => {
        setupAction();
        await mountWithCleanup(WebClient);
        getService("dialog").add(SelectCreateDialog, {
            resModel: "partner",
            onSelected: () => expect.step("selected"),
        });
        await animationFrame();
        await contains(".modal .o_data_row:first-child td[name=name]").click();
        await animationFrame();
        expect.verifySteps(["selected"]);
        await openPartnerForm(1);
        await animationFrame();
        expect(".o_listpanel_toggle [data-mode=search]").toHaveAttribute("disabled");
    });

    test("opening in a new window leaves no origin behind", async () => {
        setupAction();
        patchWithCleanup(browser, {open: () => expect.step("open")});
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_data_row:first-child td[name=name]").click({ctrlKey: true});
        await animationFrame();
        expect.verifySteps(["open"]);
        await openPartnerForm(1);
        await animationFrame();
        expect(".o_listpanel_toggle [data-mode=search]").toHaveAttribute("disabled");
    });

    test("an origin for another record is ignored and cleared", async () => {
        setPendingOrigin({
            resModel: "partner",
            resId: 3,
            domain: [],
            orderBy: [],
            offset: 0,
            limit: 80,
        });
        await mountPanel(`<listpanel domain="[]"/>`, 1);
        expect(".o_listpanel_toggle [data-mode=search]").toHaveAttribute("disabled");
        expect(takePendingOrigin("partner", 3)).toBe(null);
    });

    test("no domain declared: only Search, no toggle", async () => {
        await mountPanel(`<listpanel/>`);
        expect(".o_listpanel_toggle").toHaveCount(0);
        expect(".o_listpanel_empty").toHaveCount(1);
    });
});

describe("auto panel", () => {
    const toggle = ".o_control_panel .o_listpanel_auto_toggle";

    function setupAuto({enabled = true, list, form, context} = {}) {
        patchWithCleanup(session, {web_form_listpanel_auto_panel: enabled});
        Partner._views = {
            list:
                list ||
                `<list><field name="name"/><field name="country_id" optional="hide"/></list>`,
            kanban: `<kanban><templates><t t-name="card"><field name="name"/></t></templates></kanban>`,
            form:
                form ||
                `<form><sheet><field name="name"/><field name="country_id"/></sheet></form>`,
            search: `<search/>`,
        };
        Country._views = {list: `<list><field name="name"/></list>`};
        defineActions([
            {
                id: 1,
                name: "Partners",
                res_model: "partner",
                type: "ir.actions.act_window",
                context: context || {},
                views: [
                    [false, "list"],
                    [false, "kanban"],
                    [false, "form"],
                ],
            },
            {
                id: 2,
                name: "Countries",
                res_model: "country",
                type: "ir.actions.act_window",
                views: [[false, "list"]],
            },
        ]);
    }

    async function openFromList(row = 1) {
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(`.o_data_row:nth-child(${row}) td[name=name]`).click();
        await animationFrame();
    }

    test("no button when the setting is off", async () => {
        setupAuto({enabled: false});
        await openFromList();
        expect(toggle).toHaveCount(0);
        expect(".o_listpanel_container").toHaveCount(0);
    });

    test("no button without an origin", async () => {
        setupAuto();
        await mountWithCleanup(WebClient);
        await getService("action").doAction({
            type: "ir.actions.act_window",
            res_model: "partner",
            res_id: 1,
            views: [[false, "form"]],
        });
        await animationFrame();
        expect(toggle).toHaveCount(0);
    });

    test("no button on a form without a sheet", async () => {
        setupAuto({form: `<form><field name="name"/></form>`});
        await openFromList();
        expect(".o_form_view").toHaveCount(1);
        expect(toggle).toHaveCount(0);
    });

    test("a sheet inside a sub-form does not count", async () => {
        setupAuto({
            form: `<form>
                <field name="name"/>
                <field name="country_ids">
                    <list><field name="name"/></list>
                    <form><sheet><field name="name"/></sheet></form>
                </field>
            </form>`,
        });
        await openFromList();
        expect(toggle).toHaveCount(0);
    });

    test("a listpanel inside a sub-form does not hide the button", async () => {
        setupAuto({
            form: `<form><sheet>
                <field name="name"/>
                <field name="country_ids">
                    <list><field name="name"/></list>
                    <form><listpanel domain="[]"/><field name="name"/></form>
                </field>
            </sheet></form>`,
        });
        await openFromList();
        expect(toggle).toHaveCount(1);
    });

    test("a nested view does not get the outer form's auto state", async () => {
        const config = {};
        const auto = {config, state: {shown: true}};
        expect(listPanelAutoFor({listPanelAuto: auto, config})).toBe(auto);
        expect(listPanelAutoFor({listPanelAuto: auto, config: {}})).toBe(null);
        expect(listPanelAutoFor({config})).toBe(null);
    });

    test("a shown panel leaves no empty column on small screens", async () => {
        setupAuto();
        await openFromList();
        await contains(toggle).click();
        await animationFrame();
        await resize({width: 800});
        await animationFrame();
        expect(".o_listpanel_container").toHaveCount(0);
    });

    test("the auto panel survives a breadcrumb round trip", async () => {
        setupAuto({
            form: `<form><sheet>
                <button name="2" type="action" string="Countries" class="o_other_action"/>
                <field name="name"/>
            </sheet></form>`,
        });
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_optional_columns_dropdown_toggle").click();
        await contains(".o-dropdown-item:contains(Country) input").click();
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        await contains(toggle).click();
        await animationFrame();
        await contains(".o_other_action").click();
        await animationFrame();
        expect(".o_list_view").toHaveCount(1);
        await contains(".breadcrumb-item:nth-child(2) a").click();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel thead th")).toEqual(["Name", "Country"]);
        expect(".o_listpanel_row").toHaveCount(3);
    });

    test("a grouped list origin starts on the first page", async () => {
        setupAuto({
            list: `<list><field name="name"/><field name="country_id"/></list>`,
            context: {group_by: ["country_id"]},
        });
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_group_header:first").click();
        await contains(".o_data_row:first td[name=name]").click();
        await animationFrame();
        await contains(toggle).click();
        await animationFrame();
        expect(".o_listpanel_row").toHaveCount(3);
        expect(queryAllTexts(".o_listpanel thead th")).toEqual(["Name", "Country"]);
    });

    test("no button when the form declares the tag", async () => {
        setupAuto({
            form: `<form><listpanel domain="[]"/><sheet><field name="name"/></sheet></form>`,
        });
        await openFromList();
        expect(toggle).toHaveCount(0);
        expect(".o_listpanel_container").toHaveCount(1);
    });

    test("button shows the panel with the list's columns", async () => {
        setupAuto();
        await openFromList();
        expect(".o_listpanel_container").toHaveCount(0);
        await contains(toggle).click();
        await animationFrame();
        expect(".o_listpanel_row").toHaveCount(3);
        expect(".o_listpanel_title").toHaveText("Partners");
        expect(".o_listpanel_toggle").toHaveCount(0);
        expect(queryAllTexts(".o_listpanel_row:first-child td")).toEqual(["p1"]);
    });

    test("optional columns the user turned on are shown", async () => {
        setupAuto();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await contains(".o_optional_columns_dropdown_toggle").click();
        await contains(".o-dropdown-item:contains(Country) input").click();
        await contains(".o_data_row:first-child td[name=name]").click();
        await animationFrame();
        await contains(toggle).click();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel thead th")).toEqual(["Name", "Country"]);
        expect(queryAllTexts(".o_listpanel_row:first-child td")).toEqual([
            "p1",
            "Italy",
        ]);
    });

    test("at most three columns", async () => {
        setupAuto({
            list: `<list><field name="name"/><field name="country_id"/><field name="dom_str"/><field name="id"/></list>`,
        });
        await openFromList();
        await contains(toggle).click();
        await animationFrame();
        expect(".o_listpanel thead th").toHaveCount(3);
    });

    test("handle and invisible columns are skipped", async () => {
        setupAuto({
            list: `<list>
                <field name="id" widget="handle"/>
                <field name="name"/>
                <field name="country_id" column_invisible="1"/>
                <field name="dom_str"/>
            </list>`,
        });
        await openFromList();
        await contains(toggle).click();
        await animationFrame();
        expect(".o_listpanel thead th").toHaveCount(2);
        expect(".o_listpanel thead th:first").toHaveText("Name");
    });

    test("auto panel keeps the list's row decoration and widget", async () => {
        setupAuto({
            list: `<list decoration-danger="name == 'p2'">
                <field name="name"/>
                <field name="country_ids" widget="many2many_tags"/>
            </list>`,
        });
        await openFromList();
        await contains(toggle).click();
        await animationFrame();
        expect(".o_listpanel_row:eq(1)").toHaveClass("text-danger");
        expect(".o_listpanel_row:eq(0) .o_tag").toHaveCount(2);
    });

    test("auto panel has no optional toggler", async () => {
        setupAuto();
        await openFromList();
        await contains(toggle).click();
        await animationFrame();
        expect(".o_listpanel .o_optional_columns_dropdown").toHaveCount(0);
    });

    test("no button on small screens", async () => {
        setupAuto();
        await openFromList();
        expect(toggle).toHaveCount(1);
        await resize({width: 800});
        await animationFrame();
        expect(toggle).toHaveCount(0);
    });

    test("the choice is remembered", async () => {
        setupAuto();
        await openFromList();
        await contains(toggle).click();
        await animationFrame();
        await contains(".breadcrumb-item a").click();
        await animationFrame();
        await contains(".o_data_row:nth-child(2) td[name=name]").click();
        await animationFrame();
        expect(".o_listpanel_row").toHaveCount(3);
        expect(toggle).toHaveClass("active");
        await contains(toggle).click();
        await animationFrame();
        expect(".o_listpanel_container").toHaveCount(0);
    });

    test("kanban origin shows the display name", async () => {
        setupAuto();
        await mountWithCleanup(WebClient);
        await getService("action").doAction(1);
        await switchView("kanban");
        await contains(".o_kanban_record:first-child").click();
        await animationFrame();
        await contains(toggle).click();
        await animationFrame();
        expect(queryAllTexts(".o_listpanel_row")).toEqual(["p1", "p2", "p3"]);
        expect(queryAllTexts(".o_listpanel thead th")).toEqual(["Display name"]);
    });

    test("the panel survives a row click", async () => {
        setupAuto();
        await openFromList();
        await contains(toggle).click();
        await animationFrame();
        await contains(".o_listpanel_row:nth-child(2) .o_data_cell:first").click();
        await animationFrame();
        expect(".o_field_widget[name=name] input").toHaveValue("p2");
        expect(".o_listpanel_row").toHaveCount(3);
        expect(".o_listpanel_current").toHaveText("p2");
    });
});

describe("collapse and small screens", () => {
    test("collapse persists across remounts", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        await contains(".o_listpanel_collapse").click();
        expect(".o_listpanel_collapsed").toHaveCount(1);
        expect(".o_listpanel_row").toHaveCount(0);
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel_collapsed").toHaveCount(2);
        await contains(".o_listpanel_collapsed:first .o_listpanel_expand").click();
        expect(".o_listpanel_collapsed").toHaveCount(1);
    });

    test("unreadable storage means expanded", async () => {
        patchWithCleanup(browser.localStorage, {
            getItem(key) {
                if (key.startsWith("web_form_listpanel")) {
                    throw new Error("blocked");
                }
                return super.getItem(key);
            },
            setItem(key, value) {
                if (key.startsWith("web_form_listpanel")) {
                    throw new Error("blocked");
                }
                return super.setItem(key, value);
            },
        });
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel_collapsed").toHaveCount(0);
        await contains(".o_listpanel_collapse").click();
        expect(".o_listpanel_collapsed").toHaveCount(1);
    });

    function stepFetch() {
        onRpc("web_search_read", () => {
            expect.step("fetch");
        });
    }

    test("no fetch while collapsed", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        await contains(".o_listpanel_collapse").click();
        stepFetch();
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel_collapsed").toHaveCount(2);
        expect.verifySteps([]);
        await contains(".o_listpanel_collapsed:last .o_listpanel_expand").click();
        await animationFrame();
        expect.verifySteps(["fetch"]);
        expect(".o_listpanel_row").toHaveCount(3);
    });

    test("no fetch on small screens until widened", async () => {
        await resize({width: 800});
        stepFetch();
        await mountPanel(`<listpanel domain="[]"/>`);
        expect.verifySteps([]);
        await resize({width: 1200});
        await animationFrame();
        expect.verifySteps(["fetch"]);
        expect(".o_listpanel_row").toHaveCount(3);
    });

    test("the panel follows the scroller's height", async () => {
        await mountPanel(`<listpanel domain="[]"/>`);
        const scroller = queryOne(".o_content");
        scroller.style.maxHeight = "300px";
        await animationFrame();
        await animationFrame();
        expect(scroller.clientHeight).toBeLessThan(301);
        expect(queryOne(".o_listpanel_container").style.height).toBe(
            `${scroller.clientHeight}px`
        );
    });

    test("hidden on small screens", async () => {
        await resize({width: 800});
        await mountPanel(`<listpanel domain="[]"/>`);
        expect(".o_listpanel").toHaveCount(0);
        expect(".o_listpanel_container").toHaveCount(0);
        expect(".o_form_sheet_bg").toHaveCount(1);
    });
});
