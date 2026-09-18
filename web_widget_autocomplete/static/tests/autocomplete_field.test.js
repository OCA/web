import {describe, expect, freezeTime, test} from "@odoo/hoot";
import {advanceTime, animationFrame, runAllTimers} from "@odoo/hoot-mock";
import {
    contains,
    defineModels,
    fields,
    findComponent,
    models,
    mountView,
    onRpc,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {AutocompleteField} from "@web_widget_autocomplete/autocomplete_field.esm";
import {queryAllTexts} from "@odoo/hoot-dom";
import {charField} from "@web/views/fields/char/char_field";
import {Record} from "@web/model/relational_model/record";

class Partner extends models.Model {
    address_string = fields.Char();
    address_ref = fields.Integer();
    city = fields.Char();
    amount = fields.Float();
    enabled = fields.Boolean();
    founded = fields.Date();
    visited = fields.Datetime();
    region = fields.Selection({selection: [["center", "Center"]]});
    description = fields.Text();
    notes = fields.Html();
    price = fields.Monetary({currency_field: "currency_id"});
    currency_id = fields.Many2one({relation: "res.currency"});
    country_id = fields.Many2one({relation: "country"});
    tag_ids = fields.Many2many({relation: "country"});
    line_ids = fields.One2many({relation: "line", relation_field: "partner_id"});
    hidden = fields.Char();
    _records = [
        {
            id: 1,
            address_string: "start",
            address_ref: 7,
            city: "Old",
            amount: 1.5,
            hidden: "secret",
        },
    ];
}

class Country extends models.Model {
    name = fields.Char();
    _records = [
        {id: 1, name: "Italy"},
        {id: 2, name: "France"},
    ];
}

class Line extends models.Model {
    name = fields.Char();
    partner_id = fields.Many2one({relation: "partner"});
}

class Currency extends models.Model {
    _name = "res.currency";
    name = fields.Char();
    _records = [{id: 1, name: "EUR"}];
}

defineModels([Partner, Country, Line, Currency]);

const SUGGESTION = {
    address_string: "Perugia, Italy",
    address_ref: 12,
    city: "Perugia",
    amount: 9.9,
    hidden: "nope",
    unknown: "x",
    id: 99,
};

const EXTRA_FIELDS = `<field name="amount"/><field name="enabled"/>
             <field name="founded"/><field name="visited"/>
             <field name="region"/><field name="description"/>
             <field name="notes" invisible="1"/>
             <field name="price"/><field name="currency_id"/>
             <field name="country_id"/><field name="tag_ids" widget="many2many_tags"/>
             <field name="line_ids"><list><field name="name"/></list></field>`;

async function mountAutocompleteForm(
    options = "{'function': 'address_auto_complete'}",
    extraFields = ""
) {
    return mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `
            <form>
                <field name="address_string" widget="autocomplete" options="${options}"/>
                <field name="address_ref"/>
                <field name="city"/>
                ${extraFields}
            </form>`,
    });
}

async function typeAndWait(value) {
    await contains(".o_field_widget[name='address_string'] input").edit(value, {
        confirm: false,
    });
    await runAllTimers();
    await animationFrame();
}

function patchUpdateSteps() {
    patchWithCleanup(Record.prototype, {
        async update(changes, options) {
            if (this.resModel === "partner") {
                expect.step(`update:${Object.keys(changes).sort().join(",")}`);
            }
            return super.update(changes, options);
        },
    });
}

describe.current.tags("desktop");

describe("WebWidgetAutocomplete", () => {
    test("below min_symbols does not RPC", async () => {
        onRpc("address_auto_complete", ({args}) => {
            expect.step(args[0]);
            return [SUGGESTION];
        });
        await mountAutocompleteForm();
        await typeAndWait("ab");
        expect.verifySteps([]);
        expect(".o-autocomplete--dropdown-item").toHaveCount(0);
    });

    test("at min_symbols calls with the trimmed string", async () => {
        onRpc("address_auto_complete", ({args}) => {
            expect.step(args[0]);
            return [SUGGESTION];
        });
        await mountAutocompleteForm();
        await typeAndWait("  abc");
        expect.verifySteps(["abc"]);
        expect(queryAllTexts(".o-autocomplete--dropdown-item")).toEqual([
            "Perugia, Italy",
        ]);
    });

    test("custom min_symbols gates the RPC", async () => {
        onRpc("address_auto_complete", ({args}) => {
            expect.step(args[0]);
            return [SUGGESTION];
        });
        await mountAutocompleteForm(
            "{'function': 'address_auto_complete', 'min_symbols': 5}"
        );
        await typeAndWait("abcd");
        expect.verifySteps([]);
        await typeAndWait("abcde");
        expect.verifySteps(["abcde"]);
    });

    test("invalid min_symbols falls back to the default of 3", async () => {
        onRpc("address_auto_complete", ({args}) => {
            expect.step(args[0]);
            return [SUGGESTION];
        });
        await mountAutocompleteForm(
            "{'function': 'address_auto_complete', 'min_symbols': -1}"
        );
        await typeAndWait("ab");
        expect.verifySteps([]);
        await typeAndWait("abc");
        expect.verifySteps(["abc"]);
    });

    test("field context is forwarded to the RPC", async () => {
        onRpc("address_auto_complete", ({args, kwargs}) => {
            expect.step(args[0]);
            expect.step(`ctx:${kwargs.context.ac_token}`);
            return [SUGGESTION];
        });
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `
            <form>
                <field
                    name="address_string"
                    widget="autocomplete"
                    options="{'function': 'address_auto_complete'}"
                    context="{'ac_token': 42}"
                />
            </form>`,
        });
        await typeAndWait("abc");
        expect.verifySteps(["abc", "ctx:42"]);
    });

    test("select writes supported extras in one update", async () => {
        onRpc("address_auto_complete", () => [SUGGESTION]);
        patchUpdateSteps();
        const view = await mountAutocompleteForm(
            "{'function': 'address_auto_complete'}",
            `
                <field name="amount"/>
                <field name="id"/>
    `
        );
        const field = findComponent(view, (c) => c instanceof AutocompleteField);
        await typeAndWait("Per");
        await contains(".o-autocomplete--dropdown-item").click();
        await animationFrame();
        expect.verifySteps(["update:address_ref,address_string,amount,city"]);
        expect(field.props.record.data.address_string).toBe("Perugia, Italy");
        expect(field.props.record.data.address_ref).toBe(12);
        expect(field.props.record.data.city).toBe("Perugia");
        expect(field.props.record.data.amount).toBe(9.9);
        // Fields not in the view are not on record.data (activeFields only).
        expect(field.props.record.data.hidden).toBe(undefined);
        expect(field.props.record.data.id).toBe(1);
    });

    test("select fills and saves scalar and relational field types", async () => {
        onRpc("address_auto_complete", () => [
            {
                ...SUGGESTION,
                enabled: true,
                founded: "1540-06-01",
                visited: "2026-09-18 12:30:00",
                region: "center",
                description: "Capital of Umbria",
                notes: "<p>Perugia</p>",
                price: 42.5,
                currency_id: [1, "EUR"],
                country_id: 1,
                tag_ids: [[4, 2]],
                line_ids: [[0, 0, {name: "Visit"}]],
            },
        ]);
        onRpc("web_save", ({args}) => {
            const values = args[1];
            expect(values.amount).toBe(9.9);
            expect(values.enabled).toBe(true);
            expect(values.founded).toBe("1540-06-01");
            expect(values.visited).toBe("2026-09-18 12:30:00");
            expect(values.region).toBe("center");
            expect(values.description).toBe("Capital of Umbria");
            expect(values.notes).toBe("<p>Perugia</p>");
            expect(values.price).toBe(42.5);
            expect(values.currency_id).toBe(1);
            expect(values.country_id).toBe(1);
            expect(values.tag_ids).toEqual([[4, 2]]);
            expect(values.line_ids[0][0]).toBe(0);
            expect(values.line_ids[0][2].name).toBe("Visit");
            expect.step("saved");
        });
        const view = await mountAutocompleteForm(
            "{'function': 'address_auto_complete'}",
            EXTRA_FIELDS
        );
        await typeAndWait("Per");
        await contains(".o-autocomplete--dropdown-item").click();
        await animationFrame();
        const field = findComponent(view, (c) => c instanceof AutocompleteField);
        expect(field.props.record.data.country_id).toEqual([1, "Italy"]);
        expect(field.props.record.data.founded.isValid).toBe(true);
        expect(field.props.record.data.visited.isValid).toBe(true);
        await contains(".o_form_button_save").click();
        await animationFrame();
        expect.verifySteps(["saved"]);
        expect(field.props.record.data.country_id).toEqual([1, "Italy"]);
        expect(field.props.record.data.tag_ids.currentIds).toEqual([2]);
        expect(field.props.record.data.line_ids.records[0].data.name).toBe("Visit");
    });

    test("invalid extra values are skipped while the label is selected", async () => {
        onRpc("address_auto_complete", () => [
            {
                address_string: "Perugia",
                amount: "not a number",
                enabled: "yes",
                founded: "31/12/1999",
                visited: "invalid",
                region: "missing",
                description: 42,
                notes: [],
                price: "invalid",
                country_id: "Italy",
                tag_ids: [[6, 0, "bad"]],
                line_ids: [[0, 0, []]],
            },
        ]);
        patchUpdateSteps();
        await mountAutocompleteForm(
            "{'function': 'address_auto_complete'}",
            EXTRA_FIELDS
        );
        await typeAndWait("Per");
        await contains(".o-autocomplete--dropdown-item").click();
        await animationFrame();
        expect.verifySteps(["update:address_string"]);
        expect(".o_field_widget[name='address_string'] input").toHaveValue("Perugia");
        expect(".o_field_widget[name='amount'] input").toHaveValue("1.50");
    });

    test("replace and clear relations and optional scalar values", async () => {
        const view = await mountAutocompleteForm(
            "{'function': 'address_auto_complete'}",
            `<field name="country_id"/><field name="tag_ids" widget="many2many_tags"/>
             <field name="founded"/><field name="visited"/><field name="region"/>
             <field name="enabled"/>`
        );
        const field = findComponent(view, (c) => c instanceof AutocompleteField);
        await field.onSelect({
            values: {
                country_id: [1, "Italy"],
                tag_ids: [[6, 0, [1, 2]]],
                founded: "2026-01-01",
                visited: "2026-01-01 12:00:00",
                region: "center",
                enabled: true,
            },
        });
        await field.onSelect({values: {tag_ids: [[6, 0, [2]]]}});
        expect(field.props.record.data.tag_ids.currentIds).toEqual([2]);
        await field.onSelect({
            values: {
                country_id: false,
                tag_ids: [[6, 0, []]],
                founded: false,
                visited: false,
                region: false,
                enabled: false,
            },
        });
        await contains(".o_form_button_save").click();
        await animationFrame();
        const data = field.props.record.data;
        expect(data.country_id).toBe(false);
        expect(data.tag_ids.currentIds).toEqual([]);
        expect(data.founded).toBe(false);
        expect(data.visited).toBe(false);
        expect(data.region).toBe(false);
        expect(data.enabled).toBe(false);
    });

    test("malformed relations and unsupported command opcodes leave existing values", async () => {
        const view = await mountAutocompleteForm(
            "{'function': 'address_auto_complete'}",
            `<field name="country_id"/><field name="tag_ids" widget="many2many_tags"/>`
        );
        const field = findComponent(view, (c) => c instanceof AutocompleteField);
        await field.onSelect({values: {country_id: 1, tag_ids: [[4, 1, 0]]}});
        patchUpdateSteps();
        for (const value of [0, -1, 1.5, "Italy", [], [1, 42], [1, "Italy", "extra"]]) {
            await field.onSelect({values: {country_id: value}});
        }
        for (const value of [
            [1, 2],
            [[2, 1]],
            [[5]],
            [[1, 1, {name: "Changed"}]],
            [[4, -1]],
            [[4, 1, {}]],
            [[6, 0, ["1"]]],
            [[6, 1, []]],
            [[0, 0, null]],
            [
                [4, 2],
                [2, 1],
            ],
        ]) {
            await field.onSelect({values: {tag_ids: value}});
        }
        expect.verifySteps([]);
        expect(field.props.record.data.country_id).toEqual([1, "Italy"]);
        expect(field.props.record.data.tag_ids.currentIds).toEqual([1]);
    });

    test("Enter on a highlighted suggestion writes the selected row", async () => {
        onRpc("address_auto_complete", () => [
            SUGGESTION,
            {
                address_string: "Assisi, Italy",
                address_ref: 2,
                city: "Assisi",
            },
        ]);
        patchUpdateSteps();
        await mountAutocompleteForm();
        await typeAndWait("Per");
        expect(".o-autocomplete--dropdown-item").toHaveCount(2);
        await contains(".o_field_widget[name='address_string'] input").press(
            "ArrowDown"
        );
        await animationFrame();
        await contains(".o_field_widget[name='address_string'] input").press("Enter");
        await animationFrame();
        expect.verifySteps(["update:address_ref,address_string,city"]);
        expect(".o_field_widget[name='address_string'] input").toHaveValue(
            "Assisi, Italy"
        );
        expect(".o_field_widget[name='city'] input").toHaveValue("Assisi");
        expect(".o_field_widget[name='address_ref'] input").toHaveValue("2");
    });

    test("readonly extra is included in the select update", async () => {
        onRpc("address_auto_complete", () => [SUGGESTION]);
        patchUpdateSteps();
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `
            <form>
                <field name="address_string" widget="autocomplete" options="{'function': 'address_auto_complete'}"/>
                <field name="address_ref" readonly="1"/>
                <field name="city"/>
            </form>`,
        });
        await typeAndWait("Per");
        await contains(".o-autocomplete--dropdown-item").click();
        await animationFrame();
        expect.verifySteps(["update:address_ref,address_string,city"]);
        expect(".o_field_widget[name='address_ref']").toHaveText("12");
    });

    test("type without select commits Char and leaves extras unchanged", async () => {
        onRpc("address_auto_complete", () => [SUGGESTION]);
        patchUpdateSteps();
        await mountAutocompleteForm();
        await contains(".o_field_widget[name='address_string'] input").edit(
            "typed text",
            {confirm: "blur"}
        );
        await runAllTimers();
        await animationFrame();
        expect.verifySteps(["update:address_string"]);
        expect(".o_field_widget[name='address_string'] input").toHaveValue(
            "typed text"
        );
        expect(".o_field_widget[name='address_ref'] input").toHaveValue("7");
        expect(".o_field_widget[name='city'] input").toHaveValue("Old");
    });

    test("save without leaving the field commits typed Char via useInputField", async () => {
        onRpc("address_auto_complete", () => [SUGGESTION]);
        patchUpdateSteps();
        await mountAutocompleteForm();
        await contains(".o_field_widget[name='address_string'] input").edit("unsaved", {
            confirm: false,
        });
        await runAllTimers();
        await contains(".o_form_button_save").click();
        await animationFrame();
        expect.verifySteps(["update:address_string"]);
        expect(".o_field_widget[name='address_string'] input").toHaveValue("unsaved");
        expect(".o_field_widget[name='city'] input").toHaveValue("Old");
    });

    test("extra CharField props from other addons are not rejected", async () => {
        const extractProps = charField.extractProps;
        patchWithCleanup(charField, {
            extractProps(fieldInfo, dynamicInfo) {
                return {
                    ...extractProps(fieldInfo, dynamicInfo),
                    maxLength: 64,
                    pattern: "[A-Za-z]+",
                };
            },
        });
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `
            <form>
                <field name="address_string" widget="autocomplete" options="{'function': 'address_auto_complete'}"/>
            </form>`,
        });
        expect(".o_field_widget[name='address_string'] input").toHaveCount(1);
    });

    test("missing function does not RPC", async () => {
        onRpc("address_auto_complete", ({args}) => {
            expect.step(args[0]);
            return [SUGGESTION];
        });
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `
            <form>
                <field name="address_string" widget="autocomplete"/>
            </form>`,
        });
        await typeAndWait("abc");
        expect.verifySteps([]);
    });

    test("non-list RPC result yields an empty dropdown", async () => {
        onRpc("address_auto_complete", () => ({not: "a list"}));
        await mountAutocompleteForm();
        await typeAndWait("abc");
        expect(".o-autocomplete--dropdown-item").toHaveCount(0);
    });

    test("RPC failure warns and yields an empty dropdown", async () => {
        patchWithCleanup(console, {
            warn(message, error) {
                expect.step(message);
                expect(error).toBeInstanceOf(Error);
            },
        });
        onRpc("address_auto_complete", () => {
            throw new Error("rpc failed");
        });
        await mountAutocompleteForm();
        await typeAndWait("abc");
        expect.verifySteps(["Autocomplete suggestions could not be loaded."]);
        expect(".o-autocomplete--dropdown-item").toHaveCount(0);
    });

    test("skips non-object rows and rows without a string label", async () => {
        onRpc("address_auto_complete", () => [
            null,
            "plain",
            12,
            [],
            {address_string: 1},
            {address_ref: 2},
            {address_string: "kept"},
        ]);
        await mountAutocompleteForm();
        await typeAndWait("abc");
        expect(queryAllTexts(".o-autocomplete--dropdown-item")).toEqual(["kept"]);
    });

    test("debounce option controls when suggestions are requested", async () => {
        freezeTime();
        onRpc("address_auto_complete", ({args}) => {
            expect.step(args[0]);
            return [SUGGESTION];
        });
        await mountAutocompleteForm(
            "{'function': 'address_auto_complete', 'debounce': 5, 'min_symbols': 1}"
        );

        await contains(".o_field_widget[name='address_string'] input").edit("a", {
            confirm: false,
        });
        await animationFrame();
        expect.verifySteps([]);
        // Core AutoComplete hardcodes 250 ms; if it ignored props.delay,
        // advanceTime(5) would not fire the RPC. freezeTime() is required:
        // mockedSetTimeout otherwise starts a real timer (hoot-dom time.js).
        await advanceTime(4);
        await animationFrame();
        expect.verifySteps([]);
        await advanceTime(1);
        await animationFrame();
        expect.verifySteps(["a"]);
    });
});
