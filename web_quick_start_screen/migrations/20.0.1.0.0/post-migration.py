# Copyright 2026 Tecnativa - Carlos Dauden
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
"""Odoo 20.0 has no Font Awesome anymore: translate the stored icon names to the
Material Symbols ones, using the mapping Odoo provides for its own upgrade."""

from odoo.upgrade_code.material_symbols_icons_mapping import FA_TO_MATERIAL


def migrate(cr, version):
    cr.execute(
        "SELECT id, icon_name FROM quick_start_screen_action "
        "WHERE icon_name LIKE 'fa-%%'"
    )
    for action_id, icon_name in cr.fetchall():
        icon = FA_TO_MATERIAL.get(icon_name.strip()[3:])
        cr.execute(
            "UPDATE quick_start_screen_action SET icon_name = %s WHERE id = %s",
            (icon and icon[0], action_id),
        )
