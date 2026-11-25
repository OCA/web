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
            ["other", "Other"],
        ],
    });
    parent_id = fields.Many2one({relation: "partner"});

    _records = [
        {id: 1, name: "Acme", type: "contact"},
        {id: 2, name: "Acme Warehouse", type: "delivery"},
        {id: 3, name: "Acme Misc", type: "other"},
        {id: 4, name: "Jane", type: "contact", parent_id: 1},
    ];
}

defineModels([Partner]);

async function suggestionIcons(options) {
    patchWithCleanup(session, {web_m2x_options: {}});
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 4,
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
    expect(items).toHaveLength(3);
    return Object.fromEntries(
        items.map((el) => {
            const icon = el.querySelector("i.fa");
            return [
                el.textContent.trim(),
                icon && [...icon.classList].filter((c) => c.startsWith("fa-")),
            ];
        })
    );
}

test("suggestions show the icon mapped from field_icon", async () => {
    const icons = await suggestionIcons(
        "{'field_icon': 'type', 'icons': {'contact': 'fa-user', 'delivery': 'fa-truck'}}"
    );
    expect(icons).toEqual({
        Acme: ["fa-user", "fa-fw"],
        "Acme Warehouse": ["fa-truck", "fa-fw"],
        "Acme Misc": null,
    });
});

test("suggestions show no icon without field_icon", async () => {
    const icons = await suggestionIcons("{}");
    expect(icons).toEqual({
        Acme: null,
        "Acme Warehouse": null,
        "Acme Misc": null,
    });
});
