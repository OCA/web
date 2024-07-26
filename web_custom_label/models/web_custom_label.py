# Copyright 2023 - Today Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import api, fields, models, modules, tools

from odoo.addons.base.models.res_partner import _lang_get


class WebCustomLabel(models.Model):

    _name = "web.custom.label"
    _description = "Custom View Label"

    lang = fields.Selection(
        _lang_get,
        "Language",
        default=lambda self: self.env.lang,
        required=True,
    )
    model_ids = fields.Many2many(
        "ir.model", "ir_model_custom_label", "label_id", "model_id", "Model"
    )
    type_ = fields.Selection(
        [
            ("field", "Field"),
            ("xpath", "Xpath"),
        ],
        default="field",
        required=True,
    )
    position = fields.Selection(
        [
            ("string", "Label"),
            ("placeholder", "Placeholder"),
            ("selection", "Selection"),
            ("help", "Help"),
        ],
        default="string",
        required=True,
    )
    reference = fields.Char(required=True)
    key = fields.Char()
    term = fields.Char(required=True)
    active = fields.Boolean(default=True)

    @api.onchange("position")
    def _onchange_position(self):
        if self.position != "selection":
            self.key = False

    @api.model
    def create(self, vals):
        """Update the registry cache when a label is created.

        This allows to apply changes to view architectures when new labels are added.
        When the user refreshes his page, he sees the new labels automatically.
        """
        new_record = super().create(vals)
        modules.registry.Registry(self.env.cr.dbname).clear_caches()
        return new_record

    def write(self, vals):
        super().write(vals)
        modules.registry.Registry(self.env.cr.dbname).clear_caches()
        return True

    def unlink(self):
        super().unlink()
        modules.registry.Registry(self.env.cr.dbname).clear_caches()
        return True

    @tools.ormcache("model", "lang")
    def get(self, model, lang):
        """Find the labels matching the given model and lang code.

        :param model: the name of the model.
        :param lang: the language code
        :return: a list of custom labels values (list of dictionaries)
        """
        return (
            self.sudo()
            .env["web.custom.label"]
            .search(
                [
                    ("model_ids.model", "=", model),
                    ("lang", "=", lang),
                ]
            )
            .read()
        )
