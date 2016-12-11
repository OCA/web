# -*- coding: utf-8 -*-
# Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openupgradelib import openupgrade


@openupgrade.migrate(use_env=True)
def migrate(env, version):
    """If the system parameter exists before (manually created), don't error
    on duplicated record inserting manually the XML-ID entry before the
    loading.
    """
    param = env['ir.config_parameter'].search([
        ('key', '=', 'web_tree_many2one_clickable.default')
    ])
    if not param:
        return
    try:
        env.ref('web_tree_many2one_clickable.default')
        # XML-ID already exists - Nothing to do
    except ValueError:
        # Entry doesn't exist - Create it
        env['ir.model.data'].create({
            'module': 'web_tree_many2one_clickable',
            'name': 'default',
            'model': 'ir.config_parameter',
            'noupdate': True,
            'res_id': param.id,
        })
