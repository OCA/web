import {defineModels, fields, models, mountView} from "@web/../tests/web_test_helpers";
import {expect, test} from "@odoo/hoot";

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

    _records = [
        {id: 1, main_id: 1, x: 0, y: 0, value_float: 42, value_char: "0/0"},
        {id: 2, main_id: 1, x: 0, y: 1, value_float: 42, value_char: "0/1"},
        {id: 3, main_id: 1, x: 1, y: 0, value_float: 42, value_char: "1/0"},
        {id: 4, main_id: 1, x: 1, y: 1, value_float: 42, value_char: "1/1"},
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
