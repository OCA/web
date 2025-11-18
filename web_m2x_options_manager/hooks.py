# Copyright 2025 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from .tools import prepare_column_can_have_options, prepare_column_comodel_id


def pre_init_hook(env):
    # Pre-create and pre-fill these columns for perf reasons (might take a while to
    # let Odoo do it via the ORM for huge DBs)
    prepare_column_can_have_options(env.cr)
    prepare_column_comodel_id(env.cr)
