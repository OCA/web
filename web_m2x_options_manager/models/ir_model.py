# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class IrModel(models.Model):
    _inherit = "ir.model"

    m2x_option_ids = fields.One2many(
        "m2x.create.edit.option",
        "model_id",
    )
    m2x_comodels_option_ids = fields.One2many(
        "m2x.create.edit.option",
        "comodel_id",
    )
    comodel_field_ids = fields.One2many("ir.model.fields", "comodel_id")

    def button_empty_m2x_options(self):
        self._empty_m2x_options(own=True)

    def button_fill_m2x_options(self):
        self._fill_m2x_options(own=True)

    def button_empty_m2x_comodels_options(self):
        self._empty_m2x_options(comodels=True)

    def button_fill_m2x_comodels_options(self):
        self._fill_m2x_options(comodels=True)

    def _empty_m2x_options(self, own=False, comodels=False):
        """Removes every option for model ``self``'s fields

        :param bool own: if True, deletes options for model's fields
        :param bool comodels: if True, deletes options for fields where ``self`` is
            the field's comodel
        """
        to_delete = self.env["m2x.create.edit.option"]
        if own:
            to_delete += self.m2x_option_ids
        if comodels:
            to_delete += self.m2x_comodels_option_ids
        if to_delete:
            to_delete.unlink()

    def _fill_m2x_options(self, own=False, comodels=False):
        """Adds every missing field option for model ``self`` (with default values)

        :param bool own: if True, creates options for model's fields
        :param bool comodels: if True, creates options for fields where ``self`` is
            the field's comodel
        """
        todo = set()
        if own:
            exist = self.m2x_option_ids.field_id
            valid = self.field_id.filtered("can_have_options")
            todo.update((valid - exist).ids)
        if comodels:
            exist = self.m2x_comodels_option_ids.field_id
            valid = self.comodel_field_ids.filtered("can_have_options")
            todo.update((valid - exist).ids)
        if todo:
            self.env["m2x.create.edit.option"].create([{"field_id": i} for i in todo])
