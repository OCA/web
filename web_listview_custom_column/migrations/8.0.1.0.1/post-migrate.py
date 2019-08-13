# -*- coding: utf-8 -*-
# Copyright 2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
import re
from openerp import api, SUPERUSER_ID


def migrate(cr, version):
    """
    Find all the custom views which are supposed to apply to everyone and have
    a priority of 10000 and change it to 10001.
    """
    env = api.Environment(cr, SUPERUSER_ID, {})
    model_data = env['ir.model.data']
    model_view = env['ir.ui.view']
    data = model_data.search([
        ('module', '=', 'web_listview_custom_column'),
        ('model', '=', 'ir.ui.view'),
        ])
    # find the views applying to everyone
    views = model_view.browse(
        data.filtered(
            lambda rec: rec.name.endswith('_all')).mapped(
                'res_id'),
    )
    views.filtered(lambda rec: rec.priority == 10000).write({
        'priority': 10001,
    })
    # find the views applying to individuals
    views = model_view.browse(
        data.filtered(
            lambda rec: re.search(
                '^custom_view_.*_user_.*$', rec.name)).mapped(
                    'res_id'),
    )
    views.filtered(lambda rec: rec.priority == 10001).write({
        'priority': 10000,
    })
