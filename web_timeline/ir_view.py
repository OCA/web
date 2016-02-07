# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright 2015 ACSONE SA/NV
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
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
