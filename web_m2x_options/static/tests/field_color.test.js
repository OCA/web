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

async function suggestionStyles(options) {
    patchWithCleanup(session, {web_m2x_options: {}});
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 3,
        arch: `
            <form>
                <field name="parent_id" options="${options}"/>
            </form>`,
    });
    await contains(".o_field_many2one input").edit("Acme", {confirm: false});
    await runAllTimers();
    const items = queryAll(
        ".o_field_many2one .o-autocomplete--dropdown-item:not(.o_m2o_dropdown_option) .dropdown-item"
    );
    return Object.fromEntries(
        items.map((el) => [el.textContent.trim(), el.getAttribute("style")])
    );
}

test("color_style 'text' keeps the default text colouring", async () => {
    const styles = await suggestionStyles(
        "{'field_color': 'type', 'color_style': 'text', 'colors': {'contact': 'success', 'delivery': 'blue'}}"
    );
    expect(styles).toEqual({
        Acme: "color:success",
        "Acme Warehouse": "color:blue",
    });
});

test("color_style 'bar' draws a theme-aware left accent bar", async () => {
    const styles = await suggestionStyles(
        "{'field_color': 'type', 'color_style': 'bar', 'colors': {'contact': 'success', 'delivery': '#123456'}}"
    );
    expect(styles).toEqual({
        Acme: "box-shadow: inset 3px 0 0 var(--success)",
        "Acme Warehouse": "box-shadow: inset 3px 0 0 #123456",
    });
    // The theme variable must resolve, or the bar silently disappears.
    const acme = queryAll(".o-autocomplete--dropdown-item .dropdown-item").find(
        (el) => el.textContent.trim() === "Acme"
    );
    expect(getComputedStyle(acme).boxShadow).toMatch(/rgb/);
});
