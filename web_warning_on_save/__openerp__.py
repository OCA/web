# -*- coding: utf-8 -*-
##############################################################################
#
#    Author: Damien Crier
#    Copyright 2015 Camptocamp SA
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
{
    "name": "Web warning on save",
    "version": "1.0",
    "depends": ['web'],
    "author": "Camptocamp,Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'http://www.camptocamp.com',
    'description': """
    This module was written to extend the functionality of
    saving a record in the web interface.

    .. warning::

        In no way this module stops the save of the record.
        You must consider this as a warning displayed
        to the user AFTER save completed.

    If you don't want OpenERP to save the record, you should use constraints.

    Usage
    =====

    To use this module, you need to:

    * write a method called 'check_warning_on_save' which will make some checks
      and return a string

    example :

    def check_warning_on_save(self, cr, uid, id, context=None):
        '''
            @param: int: record_id
            @return: string: message that should be displayed to the user
        '''
        res = ""

        record = self.browse(cr, uid, id, context=context)
        # ... make some checks

        return res
    """,
    'data': [
    ],
    'js': [
        'static/src/js/web_warning_on_save.js',
    ],
    'css': [
    ],
    'qweb': [
    ],
    'installable': True,
    'auto_install': False,
}
