import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {queryAll} from "@odoo/hoot-dom";
import {runAllTimers} from "@odoo/hoot-mock";
import {session} from "@web/session";

describe.current.tags("desktop");

class Partner extends models.Model {
    name = fields.Char();
    type = fields.Selection({
        selection: [
            ["contact", "Contact"],
            ["delivery", "Delivery"],
        ],
    });
    parent_id = fields.Many2one({relation: "partner"});

    _records = [
        {id: 1, name: "Acme", type: "contact"},
        {id: 2, name: "Acme Warehouse", type: "delivery"},
        {id: 3, name: "Jane", type: "contact", parent_id: 1},
    ];
}

defineModels([Partner]);

test("many2one dropdown suggestions are coloured by field_color", async () => {
    patchWithCleanup(session, {web_m2x_options: {}});
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 3,
        arch: `
            <form>
                <field name="parent_id" options="{
                    'field_color': 'type',
                    'colors': {'contact': 'green', 'delivery': 'blue'}
                }"/>
            </form>`,
    });
    await contains(".o_field_many2one input").edit("Acme", {confirm: false});
    await runAllTimers();

    const items = queryAll(
        ".o_field_many2one .o-autocomplete--dropdown-item:not(.o_m2o_dropdown_option) .dropdown-item"
    );
    expect(items).toHaveLength(2);
    const styles = Object.fromEntries(
        items.map((el) => [el.textContent.trim(), el.getAttribute("style")])
    );
    expect(styles).toEqual({
        Acme: "color:green",
        "Acme Warehouse": "color:blue",
    });
});
