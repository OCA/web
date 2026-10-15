from odoo import api, models
from odoo.exceptions import ValidationError
from odoo.tools import sql


class SubFormChild(models.AbstractModel):
    """Child table of a 1 -> 1 relation with a `sub.form.parent` model

    The concrete model defines `_link_field`: its Many2one to the parent,
    required and with ondelete="cascade".
    """

    _name = "sub.form.child"
    _description = "Sub Form Child"

    _link_field = None

    def init(self):
        super().init()
        if self._abstract or not self._link_field:
            return
        # 1 -> 1 inside this table, the column is only known here
        sql.create_index(
            self.env.cr,
            f"{self._table}_{self._link_field}_uniq",
            self._table,
            [f'"{self._link_field}"'],
            unique=True,
        )

    @api.depends(lambda self: [self._link_field] if self._link_field else [])
    def _compute_display_name(self):
        for rec in self:
            rec.display_name = rec[rec._link_field].display_name

    @api.constrains(lambda self: [self._link_field] if self._link_field else [])
    def _check_detail_model(self):
        # a child is only created for the active table of its parent
        for rec in self:
            parent = rec[rec._link_field]
            if parent._detail_model() != rec._name:
                raise ValidationError(
                    self.env._(
                        "%(parent)s can't have a %(model)s.",
                        parent=parent.display_name,
                        model=rec._description,
                    )
                )
