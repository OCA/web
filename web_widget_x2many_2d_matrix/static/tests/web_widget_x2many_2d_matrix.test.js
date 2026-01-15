import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {queryAll} from "@odoo/hoot-dom";

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

describe("X2Many2DMatrixRenderer", () => {
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

    test("matrix totals are updated correctly after several edits", async () => {
        await mountView({
            type: "form",
            resModel: "main",
            resId: 1,
            arch: `
        <form>
            <field name="line_ids" widget="x2many_2d_matrix" field_x_axis="x" field_y_axis="y" field_value="value_float" show_row_totals="True" show_column_totals="True">
                <list>
                    <field name="x" />
                    <field name="y" />
                    <field name="value_float" />
                </list>
            </field>
        </form>`,
        });

        expect(".col-total").toHaveText("168.00");

        const inputs = queryAll(".o_field_widget input");
        // Initial state: [42, 42, 42, 42] -> Total 168

        await contains(inputs[0]).edit("100");
        // State: [100, 42, 42, 42] -> Total 226
        expect(".col-total").toHaveText("226.00");

        await contains(inputs[1]).edit("200");
        // State: [100, 200, 42, 42] -> Total 384
        expect(".col-total").toHaveText("384.00");

        await contains(inputs[2]).edit("50");
        // State: [100, 200, 50, 42] -> Total 392
        expect(".col-total").toHaveText("392.00");

        await contains(inputs[3]).edit("0");
        // State: [100, 200, 50, 0] -> Total 350
        expect(".col-total").toHaveText("350.00");

        // Edit the first one again
        await contains(inputs[0]).edit("10");
        // State: [10, 200, 50, 0] -> Total 260
        expect(".col-total").toHaveText("260.00");
    });
});
