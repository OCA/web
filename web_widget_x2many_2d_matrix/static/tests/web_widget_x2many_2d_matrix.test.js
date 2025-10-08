import {defineModels, fields, models, mountView} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";

describe.current.tags("desktop");

class Main extends models.Model {
    line_ids = fields.One2many({
        string: "Matrix",
        relation: "line",
        relation_field: "main_id",
    });

    _records = [{id: 1, line_ids: [1, 2, 3, 4]}];
}
class Line extends models.Model {
    main_id = fields.Many2one({
        relation: "main",
    });
    x = fields.Integer({});
    y = fields.Integer({});
    value_float = fields.Float({});
    value_char = fields.Char({});
    value_many2one = fields.Many2one({relation: "main"});

    _records = [
        {
            id: 1,
            main_id: 1,
            x: 0,
            y: 0,
            value_float: 42,
            value_char: "0/0",
            value_many2one: 1,
        },
        {
            id: 2,
            main_id: 1,
            x: 0,
            y: 1,
            value_float: 42,
            value_char: "0/1",
            value_many2one: 1,
        },
        {
            id: 3,
            main_id: 1,
            x: 1,
            y: 0,
            value_float: 42,
            value_char: "1/0",
            value_many2one: 1,
        },
        {
            id: 4,
            main_id: 1,
            x: 1,
            y: 1,
            value_float: 42,
            value_char: "1/1",
            value_many2one: 1,
        },
    ];
}
defineModels([Line, Main]);

test("matrix displaying float fields are rendered correctly", async () => {
    await mountView({
        type: "form",
        resModel: "main",
        resId: 1,
        arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="x" field_y_axis="y" field_value="value_float">
                <list>
                    <field name="x" />
                    <field name="y" />
                    <field name="value_float" />
                </list>
            </field>
        </form>`,
    });
    expect(".o_field_widget input").toHaveCount(4);
    expect(".col-total").toHaveText("168.00");
});

test("matrix displaying float fields can be configured", async () => {
    await mountView({
        type: "form",
        resModel: "main",
        resId: 1,
        arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="x" field_y_axis="y" field_value="value_float">
                <list>
                    <field name="x" />
                    <field name="y" />
                    <field name="value_float" digits="[16, 3]" />
                </list>
            </field>
        </form>`,
    });
    expect(".o_field_widget input").toHaveValue("42.000");
});

test("matrix displaying char fields are rendered correctly", async () => {
    await mountView({
        type: "form",
        resModel: "main",
        resId: 1,
        arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="x" field_y_axis="y" field_value="value_char">
                <list>
                    <field name="x" />
                    <field name="y" />
                    <field name="value_char" />
                </list>
            </field>
        </form>`,
    });
    expect(".o_field_widget input").toHaveCount(4);
    expect(".col-total").toHaveCount(0);
});

test("matrix displaying many2one fields are rendered correctly", async () => {
    await mountView({
        type: "form",
        resModel: "main",
        resId: 1,
        arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="x" field_y_axis="y" field_value="value_many2one">
                <list>
                    <field name="x" />
                    <field name="y" />
                    <field name="value_many2one" />
                </list>
            </field>
        </form>`,
    });
    expect(".o_field_many2one_selection").toHaveCount(4);
    expect(".o_form_uri").toHaveCount(0);
});
test("matrix displaying many2one fields can be configured", async () => {
    await mountView({
        type: "form",
        resModel: "main",
        resId: 1,
        arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="x" field_y_axis="y" field_value="value_many2one">
                <list>
                    <field name="x" />
                    <field name="y" />
                    <field name="value_many2one" readonly="x == 1" option="{'no_open': true}" />
                </list>
            </field>
        </form>`,
    });
    expect(".o_field_many2one_selection").toHaveCount(2);
    expect(".o_form_uri").toHaveCount(2);
});
test("matrix axis can be clickable", async () => {
    await mountView({
        type: "form",
        resModel: "main",
        resId: 1,
        arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="value_many2one" field_y_axis="value_many2one" field_value="value_float" x_axis_clickable="True" y_axis_clickable="True">
                <list>
                    <field name="value_float" />
                    <field name="value_many2one" />
                </list>
            </field>
        </form>`,
    });
    expect(".o_form_uri").toHaveCount(2);
});

test("matrix axis with many2one fields renders and maps correctly", async () => {
    await mountView({
        type: "form",
        resModel: "main",
        resId: 1,
        arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="value_many2one" field_y_axis="y" field_value="value_float">
                <list>
                    <field name="y" />
                    <field name="value_float" />
                    <field name="value_many2one" />
                </list>
            </field>
        </form>`,
    });

    // 1. Check if the Many2one display_name is used in the column header
    // In your Line model records, value_many2one is ID 1 (which relates to Main,1)
    // The table header should contain the display name of record 1
    expect("thead th:contains('Main,1')").toHaveCount(1);
    // 2. Check if records are mapped to the correct grid position
    // If _getPointOfRecord failed to find the ID, the matrix would be empty or misaligned
    // We expect 4 inputs because our data has 2 unique Y values and 1 unique Many2one X value
    // (Note: In your mock data, all 4 records have value_many2one: 1,
    // so they will collapse into 1 column across 2 rows if Y is 0 and 1)
    expect(".o_field_widget input").toHaveCount(2);
    // 3. Verify Aggregation still works with Many2one axis
    // Row 0 has two records (ID 1 and 3) -> 42 + 42 = 84
    expect("tbody tr:first-child .row-total").toHaveText("84.00");
});
