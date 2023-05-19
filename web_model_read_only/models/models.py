# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, exceptions, fields, models


class IrModel(models.Model):
    _inherit = "ir.model"

    readonly_group_ids = fields.Many2many(
        "res.groups", relation="ir_model_group_readonly_rel"
    )


class BaseModel(models.AbstractModel):
    _inherit = "base"

    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if operation != "read":
            model = self.env["ir.model"]._get(self._name)
            if (
                model.readonly_group_ids
                and self.env.user.groups_id & model.readonly_group_ids
            ):
                if raise_exception:
                    raise exceptions.AccessError(
                        _("You are not allowed to modify this record.")
                    )
                return False
        return super(BaseModel, self).check_access_rights(operation, raise_exception)
