# Copyright (C) 2023-Today: GRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import logging

from openupgradelib import openupgrade

logger = logging.getLogger(__name__)


@openupgrade.migrate()
def migrate(env, version):
    if not version:
        return
    cr = env.cr

    if openupgrade.table_exists(cr, "pos_config") and openupgrade.column_exists(
        cr, "pos_config", "minimum_wallet_amount"
    ):
        cr.execute(
            """
            SELECT aj.id, min(pc.minimum_wallet_amount)
            FROM account_journal aj
            INNER JOIN pos_config_journal_rel ajpc_rel
                ON ajpc_rel.journal_id = aj.id
            INNER JOIN pos_config pc
                ON pc.id = ajpc_rel.pos_config_id
            WHERE aj.is_customer_wallet_journal group by aj.id;
        """
        )
        for (journal_id, minimum_wallet_amount) in cr.fetchall():
            if minimum_wallet_amount:
                journal = env["account.journal"].browse(journal_id)
                logger.info(
                    "Initialize minimum_wallet_amount to %s for journal %s (company %s)"
                    % (minimum_wallet_amount, journal.name, journal.company_id.name)
                )
                journal.minimum_wallet_amount = minimum_wallet_amount
