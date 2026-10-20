# Copyright 2025 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tools import mute_logger

from .common import Common


class TestIrModel(Common):
    @mute_logger("odoo.models.unlink")
    def test_model_buttons(self):
        model = self._get_model("res.users")
        (model.m2x_option_ids + model.m2x_comodels_option_ids).unlink()

        # Model's fields workflow
        # 1- fill: check options have been created
        model.button_fill_m2x_options()
        options = model.m2x_option_ids
        self.assertTrue(options)
        # 2- refill: check no option has been created (they all existed already)
        model.button_fill_m2x_options()
        self.assertFalse(model.m2x_option_ids - options)
        # 3- empty: check no option exists anymore
        model.button_empty_m2x_options()
        self.assertFalse(model.m2x_option_ids)

        # Model's inverse fields workflow
        # 1- fill: check options have been created
        model.button_fill_m2x_comodels_options()
        comodels_options = model.m2x_comodels_option_ids
        self.assertTrue(comodels_options)
        # 2- refill: check no option has been created (they all existed already)
        model.button_fill_m2x_comodels_options()
        self.assertFalse(model.m2x_comodels_option_ids - comodels_options)
        # 3- empty: check no option exists anymore
        model.button_empty_m2x_comodels_options()
        self.assertFalse(model.m2x_comodels_option_ids)
