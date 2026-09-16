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

defineModels([Partner]);

const SUGGESTION = {
    address_string: "Perugia, Italy",
    address_ref: 12,
    city: "Perugia",
    amount: 9.9,
    hidden: "nope",
    unknown: "x",
    id: 99,
};

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

    test("select writes Char and extra Char/Integer in one update", async () => {
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
        expect.verifySteps(["update:address_ref,address_string,city"]);
        expect(field.props.record.data.address_string).toBe("Perugia, Italy");
        expect(field.props.record.data.address_ref).toBe(12);
        expect(field.props.record.data.city).toBe("Perugia");
        expect(field.props.record.data.amount).toBe(1.5);
        // Fields not in the view are not on record.data (activeFields only).
        expect(field.props.record.data.hidden).toBe(undefined);
        expect(field.props.record.data.id).toBe(1);
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

    test("RPC failure yields an empty dropdown", async () => {
        onRpc("address_auto_complete", () => {
            throw new Error("rpc failed");
        });
        await mountAutocompleteForm();
        await typeAndWait("abc");
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

    test("debounce option is used by DelayedAutoComplete.setup", async () => {
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
        // Core AutoComplete hardcodes 250 ms; if setup ignored props.delay,
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
