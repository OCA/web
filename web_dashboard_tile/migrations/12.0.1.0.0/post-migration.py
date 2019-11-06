# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import odoo


def migrate(cr, version):
    if not version:
        return

    with odoo.api.Environment.manage():
        env = odoo.api.Environment(cr, odoo.SUPERUSER_ID, {})

        # categories was optional in previous versions
        # affecting all tiles without categories
        tiles_without_category = env["tile.tile"].search(
            [('category_id', '=', False)])
        if tiles_without_category:
            default_category = env["tile.category"].create({
                "name": "Default Category",
                })
            tiles_without_category.write({
                'category_id': default_category.id
            })

        # Enable all categories, to generate actions and menus
        categories = env['tile.category'].with_context(
            active_test=False).search([])
        categories.write({'active': True})
