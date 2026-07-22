import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {queryAllTexts} from "@odoo/hoot-dom";

describe.current.tags("desktop");

class SaleOrder extends models.Model {
    _name = "sale.order";

    change_field = fields.Char({string: "Change"});
    bool_field = fields.Boolean({string: "Boolean"});
    content_string = fields.Char({string: "Content"});
    content_integer = fields.Integer({string: "Integer"});
    content_selection = fields.Selection({
        string: "Selection",
        selection: [["default", "Default"]],
    });

    _records = [
        {id: 1, bool_field: false, change_field: ""},
        {id: 2, bool_field: true, change_field: ""},
    ];
}

defineModels([SaleOrder]);

test("values are fetched with changing context", async () => {
    onRpc(({method, kwargs}) => {
        expect.step(method);
        if (method === "method_name") {
            if (kwargs.context.depending_on === "step-1") {
                return [["value", "Title"]];
            }
            if (kwargs.context.depending_on === "step-2") {
                return [
                    ["value", "Title"],
                    ["value_2", "Title 2"],
                ];
            }
            return [];
        }
    });
    await mountView({
        type: "form",
        resModel: "sale.order",
        resId: 1,
        arch: `
            <form>
                <field name="change_field"/>
                <field name="content_string" widget="dynamic_dropdown" options="{'values':'method_name'}" context="{'depending_on': change_field}" />
            </form>`,
    });

    await contains(".o_field_widget[name='change_field'] input").edit("step-1", {
        instantly: true,
    });
    await contains(".o_field_widget[name='content_string'] input").click();
    expect(queryAllTexts(".o_select_menu_item")).toEqual(["Title"]);

    await contains(".o_field_widget[name='change_field'] input").edit("step-2", {
        instantly: true,
    });
    await contains(".o_field_widget[name='content_string'] input").click();
    expect(queryAllTexts(".o_select_menu_item")).toEqual(["Title", "Title 2"]);

    await contains(".o_field_widget[name='change_field'] input").edit("step-other", {
        instantly: true,
    });
    await contains(".o_field_widget[name='content_string'] input").click();
    expect(queryAllTexts(".o_select_menu_item")).toEqual([]);

    expect.verifySteps([
        "get_views",
        "web_read",
        "method_name",
        "method_name",
        "method_name",
        "method_name",
    ]);
});

test("values are fetched w/o context (char)", async () => {
    onRpc(({method, kwargs}) => {
        expect.step(method);
        if (method === "method_name" && kwargs.context.depending_on) {
            return [["value b", "Value B"]];
        }
    });
    await mountView({
        type: "form",
        resModel: "sale.order",
        resId: 2,
        arch: `
            <form>
                <field name="bool_field"/>
                <field name="content_string" widget="dynamic_dropdown" options="{'values':'method_name'}" context="{'depending_on': bool_field}" />
            </form>`,
    });

    expect.verifySteps(["get_views", "web_read", "method_name"]);
    await contains(".o_field_widget[name='content_string'] input").click();
    expect(queryAllTexts(".o_select_menu_item")).toEqual(["Value B"]);
});

test("values are fetched w/o context (integer)", async () => {
    onRpc(({method, kwargs}) => {
        expect.step(method);
        if (method === "method_name" && kwargs.context.depending_on) {
            return [["10", "Value B"]];
        }
    });
    await mountView({
        type: "form",
        resModel: "sale.order",
        resId: 2,
        arch: `
            <form>
                <field name="bool_field"/>
                <field name="content_integer" widget="dynamic_dropdown" options="{'values':'method_name'}" context="{'depending_on': bool_field}" />
            </form>`,
    });

    expect.verifySteps(["get_views", "web_read", "method_name"]);
    await contains(".o_field_widget[name='content_integer'] input").click();
    expect(queryAllTexts(".o_select_menu_item")).toEqual(["Value B"]);
});

test("values are fetched w/o context (selection)", async () => {
    onRpc(({method, kwargs}) => {
        expect.step(method);
        if (method === "method_name" && kwargs.context.depending_on) {
            return [["choice b", "Choice B"]];
        }
    });
    await mountView({
        type: "form",
        resModel: "sale.order",
        resId: 2,
        arch: `
            <form>
                <field name="bool_field"/>
                <field name="content_selection" widget="dynamic_dropdown" options="{'values':'method_name'}" context="{'depending_on': bool_field}" />
            </form>`,
    });

    expect.verifySteps(["get_views", "web_read", "method_name"]);
    await contains(".o_field_widget[name='content_selection'] input").click();
    expect(queryAllTexts(".o_select_menu_item")).toEqual(["Choice B"]);
});
