from odoo.tests.common import SavepointCase


class TestBaseModel(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestBaseModel, cls).setUpClass()
        cls.base_model = cls.env["base"]

    def test_compute_field_name(self):
        """Test correct flow of changing field_name"""
        model_field_name = self.env["ir.model.fields"]._get(
            "popup.message", "field_name"
        )
        vals = {
            "model_id": model_field_name.model_id.id,
            "field_ids": model_field_name,
            "message": "test",
        }
        test_popup_message = self.env["popup.message"].sudo().create(vals)
        self.assertEqual(
            test_popup_message.field_name,
            model_field_name.name,
            msg="Must be equal to name of 'ir.model.fields' field",
        )

        model_field_title = self.env["ir.model.fields"]._get("popup.message", "title")
        vals.update({"field_ids": (model_field_name.id, model_field_title.id)})
        test_popup_message_cycle = self.env["popup.message"].sudo().create(vals)
        field_name = model_field_name.name + "," + model_field_title.name
        self.assertEqual(
            test_popup_message_cycle.field_name,
            field_name,
            msg="Must be equal to 2 join name of 'ir.model.fields' fields",
        )

    def test_get_message_informations(self):
        """Test correct flow of get_message_informations method"""
        ret_value_of_method = self.base_model.get_message_informations()
        check_ret_value = False
        if (ret_value_of_method is False) or isinstance(
            ret_value_of_method, type(self.env["popup.message"])
        ):
            check_ret_value = True
        self.assertTrue(
            check_ret_value,
            msg="Return value must be False or dictionary of popup.message objects",
        )
        self.env["popup.message"]._compute_field_name()

    def test_execute_processing(self):
        """Test correct flow of execute_processing method"""
        self.assertFalse(
            self.base_model.execute_processing(), msg="Return value must be False"
        )
