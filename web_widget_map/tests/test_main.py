from odoo.tests import common


class Test(common.TransactionCase):
    """
    Test the Map field.
    """

    def test_add_map_field(self):
        """
        Test adding a Map field to a model.
        """
        self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "location",
                "field_description": "Location",
                "ttype": "char",
                "state": "manual",
                "model": "res.partner",
                "required": False,
            }
        )
        arch, view = self.env["res.partner"]._get_view(view_id=None, view_type="form")
        found = arch.xpath("//field[@widget='map']")
        self.assertEqual(len(found), 1)

    def test_no_add_map_field(self):
        """
        Test not adding a Map field to a model.
        """
        self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "location",
                "field_description": "Location",
                "ttype": "char",
                "state": "manual",
                "model": "res.partner",
                "required": False,
            }
        )
        arch, view = self.env["res.partner"]._get_view(view_id=None, view_type="form")
        found = arch.xpath("//field[@widget='map']")
        self.assertEqual(len(found), 0)
