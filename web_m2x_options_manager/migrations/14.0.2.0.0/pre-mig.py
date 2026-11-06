# Copyright 2025 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tools.sql import column_exists, create_column, drop_constraint

# pylint: disable=odoo-addons-relative-import
from odoo.addons.web_m2x_options_manager.tools import (
    prepare_column_can_have_options,
    prepare_column_comodel_id,
)


def migrate(cr, version):
    if not version:
        return

    # Migrate values from ``option_create_edit_wizard`` to ``option_m2o_dialog``
    if not column_exists(cr, "m2x_create_edit_option", "option_m2o_dialog"):
        create_column(cr, "m2x_create_edit_option", "option_m2o_dialog", "varchar")
    cr.execute(
        """
        UPDATE m2x_create_edit_option
        SET option_m2o_dialog =
            CASE
                WHEN not option_create_edit_wizard THEN 'set_false'
                ELSE 'null'
            END
        """
    )

    # Pre-create and pre-fill these columns for perf reasons (might take a while to
    # let Odoo do it via the ORM for huge DBs)
    prepare_column_can_have_options(cr)
    prepare_column_comodel_id(cr)

    # Replaced by SQL constraint ``m2x_create_edit_option_field_uniqueness``
    drop_constraint(
        cr,
        tablename="m2x_create_edit_option",
        constraintname="m2x_create_edit_option_model_field_uniqueness",
    )
