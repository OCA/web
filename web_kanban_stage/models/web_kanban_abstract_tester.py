# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models


class WebKanbanAbstractTester(models.Model):
    '''This model is needed for testing web.kanban.abstract'''

    _name = 'web.kanban.abstract.tester'
    _inherit = 'web.kanban.abstract'
