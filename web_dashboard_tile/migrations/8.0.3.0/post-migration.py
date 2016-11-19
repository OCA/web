# -*- coding: utf-8 -*-
# © 2016 Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html


def migrate(cr, version):
    if version is None:
        return

    # Rename old fields
    cr.execute("""UPDATE tile_tile SET primary_function = 'count'""")
    cr.execute("""UPDATE tile_tile SET secondary_function = field_function""")
    cr.execute("""UPDATE tile_tile SET secondary_field_id = field_id""")
