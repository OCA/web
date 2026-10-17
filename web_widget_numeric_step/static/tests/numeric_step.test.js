import {advanceTime, animationFrame, expect, test} from "@odoo/hoot";
import {
    clickSave,
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
} from "@web/../tests/web_test_helpers";
import {
    manuallyDispatchProgrammaticEvent,
    press,
    queryOne,
    resize,
} from "@odoo/hoot-dom";

class Partner extends models.Model {
    name = fields.Char();
    qux = fields.Float();
    int_field = fields.Integer();

    _records = [{id: 1, name: "A long name ".repeat(10), qux: 5, int_field: 1200}];
}

defineModels([Partner]);

onRpc("has_group", () => true);

const INPUT = ".o_field_widget[name='qux'] input";
const MINUS = ".o_field_widget[name='qux'] button[data-mode='minus']";
const PLUS = ".o_field_widget[name='qux'] button[data-mode='plus']";

function mountForm(fieldAttrs = "") {
    return mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><field name="qux" widget="numeric_step" ${fieldAttrs}/></form>`,
    });
}

test("plus and minus buttons change the value by the default step", async () => {
    onRpc("partner", "web_save", ({args}) => {
        expect.step(`save ${args[1].qux}`);
    });
    await mountForm();
    expect(INPUT).toHaveValue("5.00");
    await contains(PLUS).click();
    expect(INPUT).toHaveValue("6.00");
    await contains(PLUS).click();
    await contains(MINUS).click();
    await contains(MINUS).click();
    await contains(MINUS).click();
    expect(INPUT).toHaveValue("4.00");
    await clickSave();
    expect.verifySteps(["save 4"]);
});

test("the step option is used", async () => {
    await mountForm(`options="{'step': 0.25}"`);
    await contains(PLUS).click();
    expect(INPUT).toHaveValue("5.25");
    await contains(MINUS).click();
    await contains(MINUS).click();
    expect(INPUT).toHaveValue("4.75");
});

test("min and max options limit the value", async () => {
    await mountForm(`options="{'step': 2, 'min': 4, 'max': 8}"`);
    await contains(PLUS).click();
    await contains(PLUS).click();
    expect(INPUT).toHaveValue("8.00");
    await contains(PLUS).click();
    expect(INPUT).toHaveValue("8.00");
    await contains(MINUS).click();
    await contains(MINUS).click();
    await contains(MINUS).click();
    expect(INPUT).toHaveValue("4.00");
});

test("arrow keys change the value", async () => {
    await mountForm(`options="{'step': 2}"`);
    await contains(INPUT).focus();
    await press("ArrowUp");
    await animationFrame();
    expect(INPUT).toHaveValue("7.00");
    await press("ArrowDown");
    await press("ArrowDown");
    await animationFrame();
    expect(INPUT).toHaveValue("3.00");
});

test("mouse wheel changes the value, with a throttle", async () => {
    await mountForm();
    await manuallyDispatchProgrammaticEvent(queryOne(INPUT), "wheel", {deltaY: -100});
    await animationFrame();
    expect(INPUT).toHaveValue("6.00");
    // A second event right after the first one is ignored
    await manuallyDispatchProgrammaticEvent(queryOne(INPUT), "wheel", {deltaY: -100});
    await animationFrame();
    expect(INPUT).toHaveValue("6.00");
    await advanceTime(100);
    await manuallyDispatchProgrammaticEvent(queryOne(INPUT), "wheel", {deltaY: 100});
    await animationFrame();
    expect(INPUT).toHaveValue("5.00");
});

test("readonly fields only show the value, like the core float field", async () => {
    await mountForm(`readonly="1"`);
    expect(".o_field_widget[name='qux'] span").toHaveText("5.00");
    expect(INPUT).toHaveCount(0);
    expect(MINUS).toHaveCount(0);
    expect(PLUS).toHaveCount(0);
});

test("integer fields are displayed and saved as integers", async () => {
    onRpc("partner", "web_save", ({args}) => {
        expect.step(`save ${args[1].int_field}`);
    });
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form>
            <field name="int_field" widget="numeric_step" options="{'step': 0.6}"/>
        </form>`,
    });
    const input = ".o_field_widget[name='int_field'] input";
    expect(input).toHaveValue("1,200");
    await contains(
        ".o_field_widget[name='int_field'] button[data-mode='plus']"
    ).click();
    expect(input).toHaveValue("1,201");
    await contains(input).edit("15");
    expect(input).toHaveValue("15");
    await clickSave();
    expect.verifySteps(["save 15"]);
});

test("placeholder and class attributes are applied", async () => {
    await mountForm(`placeholder="Quantity" class="my_custom_class"`);
    expect(INPUT).toHaveAttribute("placeholder", "Quantity");
    expect(".widget_numeric_step.my_custom_class").toHaveCount(1);
});

test("list view column is wide enough for the buttons", async () => {
    // Narrow screen and a long text column: the column gets its minimal width
    resize({width: 400});
    await mountView({
        type: "list",
        resModel: "partner",
        arch: `
            <list editable="bottom">
                <field name="name"/>
                <field name="qux" widget="numeric_step"/>
            </list>`,
    });
    // Rows only render the input while being edited
    await contains(".o_data_row td[name='qux']").click();
    // The input keeps the width of a regular float column (~92px) next to the buttons
    expect(queryOne(".o_data_row td[name='qux'] input").offsetWidth).toBeGreaterThan(
        85
    );
});
