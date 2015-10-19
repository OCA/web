# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
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
    'name': 'Tags multiple selection',
    'version': '0.1',
    'author': 'Akretion, Anybox, Odoo Community Association (OCA)',
    'descriptions': """
.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==================================================
Allows multiple selection on many2many_tags widget
==================================================

In a many2many_tags widget when a lot of entries should be selected it's
fastidious to select 80% of them. Then you may click on 'search more',
but impossible to select several attributes at once.

This module adds a checkbox to this list so multiple entries can be selected
at once.

Installation
============

It was tested on Odoo 7.0 branch.

Configuration
=============

Once installed, there is nothing else to do.

Usage
=====

Open the `search more...` popup on any ``many2many_tags`` widget.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/
           datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/7.0


Known issues / Roadmap
======================

* allow multi selection in drop-down.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and
welcomed feedback `here <https://github.com/OCA/web/issues/new?body=module:%20
web_widget_many2many_tags_multi_selection%0Aversion:%207.0%0A%0A
**Steps%20to%20reproduce**%0A-%20...%0A%0A
**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Sylvain Calador <sylvain.calador@akretion.com>
* Pierre Verkest <pverkest@anybox.fr>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.

    """,
    'depends': [
        'web',
    ],
    'demo': [],
    'website': 'https://www.akretion.com',
    'js': [
        'static/src/js/view_form.js',
    ],
    'installable': True,
    'auto_install': False,
    'license': 'AGPL-3',
}
