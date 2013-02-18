# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013 Therp BV (<http://therp.nl>).
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
    "name": "Web: allow import of models with '_inherits'",
    "version": "1.0r1",
    "author": "Therp BV",
    "category": "Tools",
    "depends": ['web'],
    "description": """
When a model has its '_inherits' defined, the associated fields are always
set to 'required'. These models cannot be imported in the web client 6.1
because the web client insists that these fields be present in the import
file. See https://bugs.launchpad.net/bugs/930318.

This module makes the web client query the content of a model's
'_inherits' so that it can exclude them from the required fields at import
time.

Due to the applied method of 'monkey patching', the installation of this
module on one database will affect all databases on the same OpenERP
installation.

This bug does not affect OpenERP 7.0, in which the import function has
been refactored.
    """,
    'js': [
        'static/src/js/data_import.js',
        ],
}
