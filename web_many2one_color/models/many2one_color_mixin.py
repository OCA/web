# Copyright 2026 glueckkanja AG
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models

COLOR_FIELDS = frozenset({"many2one_color", "many2one_color_message"})


class Many2oneColorMixin(models.AbstractModel):
    """Let many2one fields color the name of records of this model.

    Inherit this mixin on a model to let the web client highlight the
    selected record in many2one fields according to ``many2one_color``.
    The color fields are read as sub-fields of the many2one value, so
    the mixin is meant for models that backend users can read.
    """

    _name = "many2one.color.mixin"
    _description = "Many2one Color State"

    many2one_color = fields.Selection(
        selection=[("warning", "Warning"), ("critical", "Critical")],
        string="Color State",
        help="Highlight the name of this record in selection (many2one) fields: "
        "Warning shows it in yellow, Critical in red.",
    )
    many2one_color_message = fields.Text(
        string="Color State Message",
        help="Shown as tooltip on the highlighted selection field.",
    )

    @api.model
    def _get_many2one_color_models(self):
        """Return the names of the concrete models inheriting this mixin."""
        registry = self.env.registry
        names = registry.descendants([self._name], "_inherit")
        return sorted(
            name for name in names if name in registry and not registry[name]._abstract
        )

    def web_read(self, specification):
        # The web client reads the color fields as sub-fields of many2one
        # values; ``web_read`` of the parent model reads them without sudo.
        # Never fail a whole view because one referenced record is not
        # readable by the user: answer with an empty color state instead.
        if (
            self
            and specification
            and set(specification) <= COLOR_FIELDS
            and not self.env.su
        ):
            readable = self._filtered_access("read")
            if len(readable) != len(self):
                by_id = {vals["id"]: vals for vals in readable.web_read(specification)}
                empty = dict.fromkeys(specification, False)
                return [
                    by_id.get(record.id) or {"id": record.id, **empty}
                    for record in self
                ]
        return super().web_read(specification)
