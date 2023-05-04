# Copyright (C) 2023-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import logging
import odoo
_logger = logging.getLogger(__name__)


def migrate(cr, version):
    if not version:
        return

    with odoo.api.Environment.manage():
        env = odoo.api.Environment(cr, odoo.SUPERUSER_ID, {})

        for category in env["tile.category"].search([]):
            _logger.info(
                "Rewrite domain and context for the action"
                " related to the tile category %s" % category.name
            )
            vals = category._prepare_action()
            category.action_id.write({
                "domain": vals["domain"],
                "context": vals["context"],
            })
