/* eslint-disable sort-imports -- hoot* import order is intentional */
import {expect, test} from "@odoo/hoot";
import {press, queryFirst} from "@odoo/hoot-dom";
import {animationFrame, runAllTimers} from "@odoo/hoot-mock";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
} from "@web/../tests/web_test_helpers";
/* eslint-enable sort-imports */

class Parent extends models.Model {
    _name = "x2m.search.parent";

    name = fields.Char();
    line_ids = fields.One2many({
        relation: "x2m.search.line",
        relation_field: "parent_id",
    });

    _records = [
        {
            id: 1,
            name: "P1",
            line_ids: [1, 2, 3],
        },
    ];
}

class Line extends models.Model {
    _name = "x2m.search.line";

    name = fields.Char();
    parent_id = fields.Many2one({relation: "x2m.search.parent"});

    _records = [
        {id: 1, name: "AAA", parent_id: 1},
        {id: 2, name: "BBB", parent_id: 1},
        {id: 3, name: "CCC", parent_id: 1},
        // Not part of the x2many relation of parent(1)
        {id: 4, name: "AAA OUTSIDE", parent_id: false},
    ];
}

defineModels([Parent, Line]);

test("x2many searchable list: applies on Enter and Clear restores original ids", async () => {
    let lastNameSearchDomain = null;

    onRpc("x2m.search.line", "name_search", ({kwargs}) => {
        lastNameSearchDomain = kwargs.domain;
        return [[1, "AAA"]];
    });

    await mountView({
        type: "form",
        resModel: "x2m.search.parent",
        resId: 1,
        arch: `
            <form>
                <sheet>
                    <field name="line_ids">
                        <list editable="bottom" searchable="1">
                            <field name="name"/>
                        </list>
                    </field>
                </sheet>
            </form>
        `,
    });

    expect(".o_x2m_search_panel").toHaveCount(1);
    expect(".o_field_x2many_list .o_data_row").toHaveCount(3);

    const input = queryFirst(".o_x2m_search_panel input.o_searchview_input");
    expect(input).toBeTruthy();
    input.value = "AAA";
    input.dispatchEvent(new Event("input", {bubbles: true}));
    await animationFrame();

    await press(input, "Enter");
    await runAllTimers();
    await animationFrame();

    expect(lastNameSearchDomain).toBeTruthy();
    // Critical regression check: StaticList searches must not leak outside the current x2many ids.
    expect(JSON.stringify(lastNameSearchDomain)).toContain('"id","in",[1,2,3]');
    expect(".o_field_x2many_list .o_data_row").toHaveCount(1);

    await contains(".o_x2m_search_panel button[aria-label='Clear']").click();
    await runAllTimers();
    await animationFrame();

    // Must restore the original x2many relation (3 lines), not the full comodel dataset (4 lines).
    expect(".o_field_x2many_list .o_data_row").toHaveCount(3);
});

test("x2many searchable list: not rendered when searchable is missing", async () => {
    await mountView({
        type: "form",
        resModel: "x2m.search.parent",
        resId: 1,
        arch: `
            <form>
                <sheet>
                    <field name="line_ids">
                        <list editable="bottom">
                            <field name="name"/>
                        </list>
                    </field>
                </sheet>
            </form>
        `,
    });

    expect(".o_x2m_search_panel").toHaveCount(0);
});
