// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import {
    Many2OneField,
    buildM2OFieldDescription,
    extractM2OFieldProps,
} from "@web/views/fields/many2one/many2one_field";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {registry} from "@web/core/registry";
import {runAllTimers} from "@odoo/hoot-mock";
import {session} from "@web/session";

describe.current.tags("desktop");

class Partner extends models.Model {
    name = fields.Char();
    product_id = fields.Many2one({relation: "product"});
    _records = [
        {id: 1, name: "first record"},
        {id: 2, name: "second record", product_id: 1},
    ];
}

class Product extends models.Model {
    name = fields.Char();
    _records = [{id: 1, name: "existing product"}];
}

defineModels([Partner, Product]);

onRpc("has_group", () => true);

async function mountForm(resId, options) {
    await mountView({
        type: "form",
        resModel: "partner",
        resId,
        arch: `<form><field name="product_id" ${options || ""}/></form>`,
    });
}

async function openDropdown(options) {
    await mountForm(1, options);
    await contains(`[name="product_id"] input`).edit("ABC", {confirm: false});
    await runAllTimers();
}

test("system parameters hide create and create and edit", async () => {
    patchWithCleanup(session, {
        web_m2x_options: {
            "web_m2x_options.create": "False",
            "web_m2x_options.create_edit": "False",
        },
    });
    await openDropdown();
    expect(".o_m2o_dropdown_option_create").toHaveCount(0);
    expect(".o_m2o_dropdown_option_create_edit").toHaveCount(0);
});

test("no_quick_create: False and no_create_edit: False override the system parameters", async () => {
    patchWithCleanup(session, {
        web_m2x_options: {
            "web_m2x_options.create": "False",
            "web_m2x_options.create_edit": "False",
        },
    });
    await openDropdown(`options="{'no_quick_create': False, 'no_create_edit': False}"`);
    expect(".o_m2o_dropdown_option_create").toHaveCount(1);
    expect(".o_m2o_dropdown_option_create_edit").toHaveCount(1);
});

test("create: True and create_edit: True override the system parameters", async () => {
    patchWithCleanup(session, {
        web_m2x_options: {
            "web_m2x_options.create": "False",
            "web_m2x_options.create_edit": "False",
        },
    });
    await openDropdown(`options="{'create': True, 'create_edit': True}"`);
    expect(".o_m2o_dropdown_option_create").toHaveCount(1);
    expect(".o_m2o_dropdown_option_create_edit").toHaveCount(1);
});

test("system parameters apply to widgets with their own extractProps", async () => {
    patchWithCleanup(session, {
        web_m2x_options: {
            "web_m2x_options.create": "False",
            "web_m2x_options.create_edit": "False",
        },
    });
    registry.category("fields").add("test_own_extract_props", {
        ...buildM2OFieldDescription(Many2OneField),
        extractProps: extractM2OFieldProps,
    });
    await openDropdown(`widget="test_own_extract_props"`);
    expect(".o_m2o_dropdown_option_create").toHaveCount(0);
    expect(".o_m2o_dropdown_option_create_edit").toHaveCount(0);
});

test("open system parameter hides the internal link", async () => {
    patchWithCleanup(session, {
        web_m2x_options: {"web_m2x_options.open": "False"},
    });
    await mountForm(2);
    expect(".o_external_button").toHaveCount(0);
});

test("no_open: False on the field shows the internal link", async () => {
    patchWithCleanup(session, {
        web_m2x_options: {"web_m2x_options.open": "False"},
    });
    await mountForm(2, `options="{'no_open': False}"`);
    expect(".o_external_button").toHaveCount(1);
});
