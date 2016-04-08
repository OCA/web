# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models
from openerp import api


TIMELINE_VIEW = ('timeline', 'Timeline')


class IrUIView(models.Model):
    _inherit = 'ir.ui.view'

    @api.model
    def _setup_fields(self):
        """Hack due since the field 'type' is not defined with the new api.
        """
        cls = type(self)
        type_selection = cls._fields['type'].selection
        if TIMELINE_VIEW not in type_selection:
            tmp = list(type_selection)
            tmp.append(TIMELINE_VIEW)
            cls._fields['type'].selection = tuple(set(tmp))
        super(IrUIView, self)._setup_fields()
