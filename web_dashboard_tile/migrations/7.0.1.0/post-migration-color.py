# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2015-Today GRAP
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################


COLOR_NUMERIC_TO_RVB = {
    0: '#006015',
    1: '#CD2513',
    2: '#CDC713',
    3: '#57158A',
    4: '#0E9B2D',
    5: '#7F0C00',
    6: '#7F7B00',
    7: '#320455',
    8: '#CD6E13',
    9: '#0E6C7E',
}


def migrate_color(cr):
    for old, new in COLOR_NUMERIC_TO_RVB.iteritems():
        cr.execute("""
            UPDATE tile_tile
            SET color='%s', font_color='#FFFFFF'
            WHERE color='%s'
        """ % (new, old))


def migrate(cr, installed_version):
    migrate_color(cr)
