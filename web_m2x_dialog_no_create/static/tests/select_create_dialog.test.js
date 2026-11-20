// Copyright 2026 Quartile (https://www.quartile.co)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {expect, test} from "@odoo/hoot";
import {
    contains,
    defineModels,
    fields,
    getService,
    models,
    mountWithCleanup,
    onRpc,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {WebClient} from "@web/webclient/webclient";
import {animationFrame} from "@odoo/hoot-mock";
import {session} from "@web/session";

class Partner extends models.Model {
    name = fields.Char();
    _records = [
        {id: 1, name: "first"},
        {id: 2, name: "second"},
    ];
    _views = {
        list: /* xml */ `<list><field name="name"/></list>`,
        search: /* xml */ `<search><field name="name"/></search>`,
        form: /* xml */ `<form><field name="name"/></form>`,
    };
}

defineModels([Partner]);

const openDialog = async (props = {}) => {
    await mountWithCleanup(WebClient);
    getService("dialog").add(SelectCreateDialog, {
        resModel: "partner",
        ...props,
    });
    await animationFrame();
    expect(".o_dialog").toHaveCount(1);
};

test("New button is hidden when model is not in the allow-list", async () => {
    onRpc("has_group", () => true);
    patchWithCleanup(session, {
        web_m2x_dialog_no_create: {allowed_models: []},
    });
    await openDialog();
    expect(".o_dialog footer button.o_create_button").toHaveCount(0);
});

test("New button is shown when model is in the allow-list", async () => {
    onRpc("has_group", () => true);
    patchWithCleanup(session, {
        web_m2x_dialog_no_create: {allowed_models: ["partner"]},
    });
    await openDialog();
    expect(".o_dialog footer button.o_create_button").toHaveCount(1);
    await contains(".o_dialog footer button.o_create_button").click();
    expect(".o_dialog .o_form_view").toHaveCount(1);
});

test("noCreate prop still hides New button when model is allow-listed", async () => {
    onRpc("has_group", () => true);
    patchWithCleanup(session, {
        web_m2x_dialog_no_create: {allowed_models: ["partner"]},
    });
    await openDialog({noCreate: true});
    expect(".o_dialog footer button.o_create_button").toHaveCount(0);
});
