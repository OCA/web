# Copyright 2023 ooops404
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import common


class TestFieldRequiredIvisibleManager(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestFieldRequiredIvisibleManager, cls).setUpClass()
        cls.partner_name_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner"), ("name", "=", "name")]
        )
        cls.partner_id_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner"), ("name", "=", "id")]
        )
        cls.partner_model_id = cls.partner_name_field_id.model_id
        cls.partner_title_model_id = cls.env["ir.model"].search(
            [("name", "=", "res.partner.title")]
        )
        cls.partner_title_name_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner.title"), ("name", "=", "name")]
        )
        cls.partner_title_shortcut_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner.title"), ("name", "=", "shortcut")]
        )
        cls.invisible_title_rec_id = cls.env["custom.field.restriction"].create(
            {
                "invisible_model_id": cls.partner_title_model_id.id,
                "field_id": cls.partner_title_shortcut_field_id.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "field_invisible": True,
            }
        )
        cls.invisible_rec_id = cls.env["custom.field.restriction"].create(
            {
                "invisible_model_id": cls.partner_model_id.id,
                "field_id": cls.partner_id_field_id.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "field_invisible": True,
                "condition_domain": "[('id', '<', 0)]",
            }
        )
        cls.required_rec_id = cls.env["custom.field.restriction"].create(
            {
                "required_model_id": cls.partner_model_id.id,
                "field_id": cls.partner_id_field_id.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "required": True,
                "condition_domain": "[('id', '>', 0)]",
            }
        )
        cls.deco_addict = cls.env.ref("base.res_partner_2")
        cls.partner_view = cls.env.ref("base.view_partner_simple_form")

    def test_all_web_field_required_invisible_manager(self):
        # onchange_field_id()
        self.assertFalse(self.invisible_title_rec_id.required)
        self.invisible_title_rec_id.field_id = self.partner_title_name_field_id
        self.invisible_title_rec_id.onchange_field_id()
        self.assertTrue(self.invisible_title_rec_id.required)
        # _compute_model_name()
        self.invisible_rec_id._compute_model_name()
        self.assertEqual(self.invisible_rec_id.model_name, "res.partner")
        self.required_rec_id._compute_model_name()
        self.assertEqual(self.required_rec_id.model_name, "res.partner")
        # fields_view_get()
        self.deco_addict.fields_view_get(view_id=self.partner_view.id, view_type="form")
