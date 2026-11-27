# Copyright 2020 Camptocamp SA
# Copyright 2023 Michael Tietz (MT Software) <mtietz@mt-software.de>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

import logging
import os

import psycopg2

from odoo import fields
from odoo.modules.registry import Registry
from odoo.tools import config

logger = logging.getLogger(__name__)


def active_cron_assets():
    """Plan the next execution of the cron responsible to generate assets."""
    if os.environ.get("RUNNING_ENV") == "dev":
        return
    dbname = config["db_name"]
    reg = Registry(dbname)
    with reg.cursor() as cr:
        cron_module, cron_ref = "web_assets_warmup", "cron_generate_assets"
        query = """
           SELECT model, res_id
           FROM ir_model_data
           WHERE module=%s
           AND name=%s;
        """
        args = (cron_module, cron_ref)
        cr.execute(query, args)
        row = cr.fetchone()
        # post_load hook is called before the update of the module so the
        # ir_cron record doesn't exist on first install
        if row:
            model, res_id = row
            if model != "ir.cron":
                return
            # if there is already someone doing the same or already being executed
            # we can skip the update of ir_cron
            try:
                with cr.savepoint():
                    cr.execute(
                        "SELECT * FROM ir_cron WHERE id = %s FOR UPDATE NOWAIT;",
                        (res_id,),
                    )
                    query = """
                        UPDATE ir_cron
                        SET active=true, nextcall=%s, priority=%s
                        WHERE id=%s
                    """
                    nextcall = fields.Datetime.to_string(fields.Datetime.now())
                    args = (nextcall, -99, res_id)
                    cr.execute(query, args)
                    logger.info(
                        "Cron '%s.%s' planned for execution at %s",
                        cron_module,
                        cron_ref,
                        nextcall,
                    )
            except psycopg2.OperationalError as e:
                if e.pgcode == "55P03":
                    logger.info(
                        "Cron '%s.%s' is currently being executed or updated",
                        cron_module,
                        cron_ref,
                    )


def post_load_hook():
    active_cron_assets()
