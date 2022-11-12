# Copyright 2019 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class Base(models.AbstractModel):
    _inherit = "base"

    def _get_record_parents(self, field):
        if not self or not hasattr(self, self._parent_name):
            return []
        return getattr(self, self._parent_name)._get_record_parents(field) + [
            (self.id, str(getattr(self, field)))
        ]

    def _get_record_direct_childs(self, field, domain):
        if not hasattr(self, self._parent_name):
            return []
        return [
            (r.id, str(getattr(r, field)))
            for r in self.search([(self._parent_name, "=", self.id or False)] + domain)
        ]

    def get_record_direct_childs_parents(self, options, domain=False):
        if not domain:
            domain = []
        field = options.get("child_selection_field", "display_name")
        return {
            "childs": self._get_record_direct_childs(field, domain),
            "parents": self._get_record_parents(field),
        }
