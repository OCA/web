# Copyright 2025 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tools.sql import column_exists, create_column


def prepare_column_can_have_options(cr):
    """Creates column ``ir_model_fields.can_have_options`` and fills its values"""
    if not column_exists(cr, "ir_model_fields", "can_have_options"):
        create_column(cr, "ir_model_fields", "can_have_options", "boolean")
        cr.execute(
            """
            UPDATE ir_model_fields
            SET can_have_options =
                CASE
                    WHEN ttype in ('many2many', 'many2one') THEN true
                    ELSE false
                END
            """
        )


def prepare_column_comodel_id(cr):
    """Creates column ``ir_model_fields.comodel_id`` and fills its values"""
    if not column_exists(cr, "ir_model_fields", "comodel_id"):
        create_column(cr, "ir_model_fields", "comodel_id", "int4")
        cr.execute(
            """
            UPDATE ir_model_fields
            SET comodel_id = m.id
            FROM ir_model m
            WHERE relation = m.model
            """
        )
