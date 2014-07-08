# -*- coding: utf-8 -*-
##############################################################################
#    Financed and Planified by Vauxoo
#    developed by: tulio@vauxoo.com
#

#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': "NO create database link",
    'author': "Vauxoo",
    'category': "Web",
    'website': "http://vauxoo.com",
    'description': """
After install this module, you will not see anymore the
"Manage Databases" link in login screen.

See the image bellow:

.. image:: web_nocreatedb/static/src/img/screen.png

How to use:

When you start your server add the name of this module in the "load" option::

    $./openerp-server --load=web,web_nocreatedb -u all -d database

Then you can start your server without the -u and -d (just the first time you
need update all to be sure all base and web will be fine).

With this option you can just take off and restart the server if you need to show
the link temporaly again.

TODO: It should be great add a parameter in the database to hide it configurable
way and with web_preload: True, but BTW, in old versions of openerp it was a
parameter in the config file, i think as it is is fine for now.

.. note:: This module probably will not be shown in your module list by default
You should create a menu to see "All modules without filter.
    """,
    'version': "1.0",
    'depends': [
        'web',
    ],
    'js': [
    ],
    'css': [
    ],
    'qweb': [
        'static/src/xml/web_nocreatedb.xml',
    ],
    'installable': True,
    'auto_install': False,
}
