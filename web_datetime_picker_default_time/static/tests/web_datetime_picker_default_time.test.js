import {expect, test} from "@odoo/hoot";
import {click, hover, queryOne, waitFor} from "@odoo/hoot-dom";

import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
} from "@web/../tests/web_test_helpers";

class ProductPricelistItem extends models.Model {
    _name = "product.pricelist.item";
    _inherit = [];

    default_date = fields.Json();
    date_start = fields.Datetime();
    date_end = fields.Datetime();
    datetime_field = fields.Datetime({string: "Datetime Field"});

    _records = [{id: 1, default_date: '{"hour": 8, "minute": 30, "second": 15}'}];
}

defineModels([ProductPricelistItem]);

test("Default time is applied correctly for datetime field", async () => {
    await mountView({
        type: "form",
        resModel: "product.pricelist.item",
        arch: `
            <form>
                <field name="datetime_field" widget="datetime" options="{'defaultTime': { 'hour': 5, 'minute': 5, 'second': 5 }}" />
            </form>`,
    });

    const dateTimeFieldSelector = "input[data-field='datetime_field']";
    await click(dateTimeFieldSelector);
    await contains(".o_date_picker .o_datetime_button:first").click();
    const dateTimeFieldElement = queryOne(dateTimeFieldSelector);
    const date = new Date(dateTimeFieldElement.value);

    expect(date.getHours()).toBe(5);
    expect(date.getMinutes()).toBe(5);
    expect(date.getSeconds()).toBe(5);
});

test("Default time is applied correctly for daterange field", async () => {
    await mountView({
        type: "form",
        resModel: "product.pricelist.item",
        arch: `
            <form>
                <field name="date_start" widget="daterange" options="{'end_date_field': 'date_end', 'defaultStartTime': {'hour': 2, 'minute': 22, 'second': 22,}, 'defaultEndTime': {'hour': 3, 'minute': 33, 'second': 33,}}"/>
            </form>`,
    });

    // Test defaultStartTime
    const dateStartFieldSelector = "input[data-field='date_start']";
    await click(dateStartFieldSelector);
    await contains(".o_date_picker .o_datetime_button:first").click();
    const dateStartFieldElement = queryOne(dateStartFieldSelector);
    const dateStart = new Date(dateStartFieldElement.value);

    expect(dateStart.getHours()).toBe(2);
    expect(dateStart.getMinutes()).toBe(22);
    expect(dateStart.getSeconds()).toBe(22);

    // Test defaultEndTime
    await hover("div[name='date_start']");
    await contains(".o_add_end_date").click();
    await contains(".o_date_picker:nth-of-type(2) .o_datetime_button:last").click();
    await waitFor("input[data-field='date_end']");
    const dateEndFieldElement = queryOne("input[data-field='date_end']");
    const dateEnd = new Date(dateEndFieldElement.value);

    expect(dateEnd.getHours()).toBe(3);
    expect(dateEnd.getMinutes()).toBe(33);
    expect(dateEnd.getSeconds()).toBe(33);
});

onRpc("has_group", () => true);
test("Default time is applied correctly for list.datetime field", async () => {
    await mountView({
        type: "list",
        resModel: "product.pricelist.item",
        arch: `
            <list editable="bottom">
                <field name="datetime_field" widget="datetime" options="{'defaultTime': { 'hour': 5, 'minute': 5, 'second': 5 }}" />
            </list>`,
    });

    await contains(".o_control_panel_main_buttons .o_list_button_add").click();
    const dateTimeFieldSelector = "input[data-field='datetime_field']";
    await contains(dateTimeFieldSelector).click();
    await contains(".o_date_picker .o_datetime_button:first").click();
    const dateTimeFieldElement = queryOne(dateTimeFieldSelector);
    const date = new Date(dateTimeFieldElement.value);

    expect(date.getHours()).toBe(5);
    expect(date.getMinutes()).toBe(5);
    expect(date.getSeconds()).toBe(5);
});

test("Default time is applied correctly for list.daterange field", async () => {
    await mountView({
        type: "list",
        resModel: "product.pricelist.item",
        arch: `
            <list editable="bottom">
                <field name="date_start" widget="daterange" options="{'end_date_field': 'date_end', 'defaultStartTime': {'hour': 2, 'minute': 22, 'second': 22,}, 'defaultEndTime': {'hour': 3, 'minute': 33, 'second': 33,}}"/>
            </list>`,
    });

    await contains(".o_control_panel_main_buttons .o_list_button_add").click();

    // Test defaultStartTime
    const dateStartFieldSelector = "input[data-field='date_start']";
    await contains(dateStartFieldSelector).click();
    await contains(".o_date_picker .o_datetime_button:first").click();
    const dateStartFieldElement = queryOne(dateStartFieldSelector);
    const dateStart = new Date(dateStartFieldElement.value);

    expect(dateStart.getHours()).toBe(2);
    expect(dateStart.getMinutes()).toBe(22);
    expect(dateStart.getSeconds()).toBe(22);

    // Test defaultEndTime
    await contains(".o_add_end_date").click();
    await contains(".o_date_picker .o_datetime_button:first").click();
    await contains(".o_date_picker .o_datetime_button:last").click();
    await contains(".o_date_picker .o_datetime_button:last").click();
    await contains("button.o_apply").click();
    await waitFor("input[data-field='date_end']", {timeout: 1500});

    const dateEndFieldElement = queryOne("input[data-field='date_end']");
    const dateEnd = new Date(dateEndFieldElement.value);

    expect(dateEnd.getHours()).toBe(3);
    expect(dateEnd.getMinutes()).toBe(33);
    expect(dateEnd.getSeconds()).toBe(33);
});

test("Dynamic default time is applied correctly", async () => {
    await mountView({
        type: "form",
        resId: 1,
        resModel: "product.pricelist.item",
        arch: `
            <form>
                <field name="default_date" invisible="1"/>
                <field name="datetime_field" widget="datetime" options="{'defaultTime': 'default_date'}" />
            </form>`,
    });

    const dateTimeFieldSelector = "input[data-field='datetime_field']";
    await click(dateTimeFieldSelector);
    await waitFor(".o_date_picker .o_datetime_button");
    await click(".o_date_picker .o_datetime_button:first");
    const dateTimeFieldElement = queryOne(dateTimeFieldSelector);
    const date = new Date(dateTimeFieldElement.value);

    expect(date.getHours()).toBe(8);
    expect(date.getMinutes()).toBe(30);
    expect(date.getSeconds()).toBe(15);
});
