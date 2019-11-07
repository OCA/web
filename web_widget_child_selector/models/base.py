# Copyright 2019 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, _


class Base(models.AbstractModel):
    _inherit = 'base'

    def get_record_parent(self):
        self.ensure_one()
        if not hasattr(self, self._parent_name):
            return False
        parent = getattr(self, self._parent_name)
        if not parent:
            return False
        return parent.name_get()[0]

    def _get_record_parents(self, field):
        if not self:
            return [(False, _('Root'))]
        return getattr(
            self, self._parent_name
        )._get_record_parents(field) + [(self.id, str(getattr(self, field)))]

    def _get_record_direct_childs(self, field):
        if not hasattr(self, self._parent_name):
            return []
        return [(r.id, str(getattr(r, field))) for r in self.search([(
            self._parent_name, '=', self.id or False
        )])]

    def get_record_direct_childs_parents(self, options):
        field = options.get('child_selection_field', 'display_name')
        return {
            'childs': self._get_record_direct_childs(field),
            'parents': self._get_record_parents(field)
        }
