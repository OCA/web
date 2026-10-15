from odoo import api, fields, models


class SubFormParent(models.AbstractModel):
    """Parent of a 1 -> 1 relation with several child tables

    Only the child matching `_detail_model()` is the active one, shown by the
    `sub_view_form` widget through `detail_ref`. The other ones are kept as
    orphans to be found again when the parent switches back.

    The concrete model defines:
    - `_detail_fields`: fields deciding the child table
    - `_detail_selection()`: the child tables, as a Reference selection
    - `_detail_model()`: the child table of one record, or False
    """

    _name = "sub.form.parent"
    _description = "Sub Form Parent"

    _detail_fields = []

    detail_ref = fields.Reference(
        selection="_detail_selection", compute="_compute_detail_ref"
    )

    @api.model
    def _detail_selection(self):
        return []

    @api.model
    def _detail_models(self):
        return [model for model, _label in self._detail_selection()]

    def _detail_model(self):
        return False

    def _find_detail(self, model):
        self.ensure_one()
        child = self.env[model]
        # _origin: the form may compute it on a NewId record
        return child.search([(child._link_field, "=", self._origin.id)], limit=1)

    @api.depends(lambda self: self._detail_fields)
    def _compute_detail_ref(self):
        for rec in self:
            model = rec._detail_model()
            detail = model and rec._find_detail(model)
            rec.detail_ref = f"{model},{detail.id}" if detail else False

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        records._sync_detail()
        return records

    def write(self, vals):
        res = super().write(vals)
        if set(vals) & set(self._detail_fields):
            self._sync_detail()
        return res

    def _sync_detail(self):
        """Create the active child if missing, the other ones are kept"""
        for rec in self:
            model = rec._detail_model()
            if model and not rec._find_detail(model):
                child = self.env[model]
                child.create({child._link_field: rec.id})
