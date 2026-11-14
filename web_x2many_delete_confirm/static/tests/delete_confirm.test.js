/* Copyright 2026 Escodoo
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {session} from "@web/session";

class Partner extends models.Model {
    name = fields.Char();
    line_ids = fields.One2many({relation: "partner.line"});
    _records = [{id: 1, name: "first record", line_ids: [1]}];
}

class PartnerLine extends models.Model {
    _name = "partner.line";
    name = fields.Char();
    partner_id = fields.Many2one({relation: "partner"});
    _records = [{id: 1, name: "first line", partner_id: 1}];
}

defineModels([Partner, PartnerLine]);

describe.current.tags("desktop");

const FORM_ARCH = `
    <form>
        <field name="line_ids">
            <list editable="bottom"><field name="name"/></list>
        </field>
    </form>`;

function patchRules(rules) {
    patchWithCleanup(session, {x2many_delete_confirm_rules: rules});
}

async function mountForm() {
    await mountView({resModel: "partner", type: "form", arch: FORM_ARCH, resId: 1});
}

describe("X2manyDeleteConfirm", () => {
    test("no rule: the line is deleted without confirmation", async () => {
        patchRules({});
        await mountForm();
        await contains(".o_data_row .o_list_record_remove").click();
        expect(".modal-dialog").toHaveCount(0);
        expect(".o_data_row").toHaveCount(0);
    });

    test("matching rule: confirming deletes the line", async () => {
        patchRules({
            "partner.line": [
                {
                    parent_model: "partner",
                    title: "Confirmar exclusão",
                    message: "Deseja realmente excluir esta linha?",
                },
            ],
        });
        await mountForm();
        await contains(".o_data_row .o_list_record_remove").click();
        expect(".modal .modal-title").toHaveText("Confirmar exclusão");
        expect(".modal .modal-body").toHaveText("Deseja realmente excluir esta linha?");
        expect(".o_data_row").toHaveCount(1);

        await contains(".modal .btn-primary").click();
        expect(".modal-dialog").toHaveCount(0);
        expect(".o_data_row").toHaveCount(0);
    });

    test("matching rule: cancelling keeps the line", async () => {
        patchRules({
            "partner.line": [{parent_model: false, title: false, message: false}],
        });
        await mountForm();
        await contains(".o_data_row .o_list_record_remove").click();
        expect(".modal-dialog").toHaveCount(1);

        await contains(".modal .btn-secondary").click();
        expect(".modal-dialog").toHaveCount(0);
        expect(".o_data_row").toHaveCount(1);
    });

    test("empty title and message fall back on the defaults", async () => {
        patchRules({
            "partner.line": [{parent_model: false, title: false, message: false}],
        });
        await mountForm();
        await contains(".o_data_row .o_list_record_remove").click();
        expect(".modal .modal-title").toHaveText("Confirm deletion");
        expect(".modal .modal-body").toHaveText(
            "Do you really want to delete this line?"
        );
    });

    test("rule bound to another parent model does not apply", async () => {
        patchRules({
            "partner.line": [
                {parent_model: "res.company", title: false, message: false},
            ],
        });
        await mountForm();
        await contains(".o_data_row .o_list_record_remove").click();
        expect(".modal-dialog").toHaveCount(0);
        expect(".o_data_row").toHaveCount(0);
    });
});
