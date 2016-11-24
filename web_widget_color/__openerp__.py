# -*- encoding: utf-8 -*-
############################################################################
#
# Odoo, Open Source Web Widget Color
# Copyright (C) 2012 Savoir-faire Linux (<http://www.savoirfairelinux.com>).
# Copyright (C) 2014 Anybox <http://anybox.fr>
# Copyright (C) 2015 Taktik SA <http://taktik.be>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# @author Étienne Beaudry Auger <etienne.b.auger@savoirfairelinux.com>
# @author Adil Houmadi <ah@taktik.be>
#
##############################################################################
{
    'name': "Web Widget Color",
    'category': "web",
    'version': "1.0",
    'depends': ['base', 'web'],
    'description': '''
Color widget for Odoo web client
================================

This module aims to add a color picker to Odoo.

It's a `jsColor <http://jscolor.com/>`_ lib integration.


Features
========

* The picker allow the user to quickly select a color on edit mode

  |picker|

  .. note::

      Notice how html code and the background color is updating when selecting
      a color.


* Display the color on form view when you are not editing it

  |formview|

* Display the color on list view to quickly find what's wrong!

  |listview|


Requirements
============

This module has been ported to 8.0


Usage
=====

You need to declare a char field of at least size 7::

    _columns = {
        'color': fields.char(
            u"Couleur",
            help=u"Toutes couleur valid css, exemple blue ou #f57900"
        ),
    }

    OR

    color = fields.Char(
        string="Color",
        help="Choose your color"
    )


In the view declaration, put widget='color' attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name"/>
            <field name="color" widget="color"/>
            ...
        </tree>
    </field>
    ...

.. |picker| image:: /web_widget_color/static/src/img/picker.png
.. |formview| image:: /web_widget_color/static/src/img/form_view.png
.. |listview| image:: /web_widget_color/static/src/img/list_view.png

Credits
=======

Contributors
------------

* Adil Houmadi <adil.houmadi@gmail.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.''',
    'qweb': [
        'static/src/xml/widget.xml',
    ],
    'css': [
        'static/src/css/widget.css',
    ],
    'js': [
        'static/lib/jscolor/jscolor.js',
        'static/src/js/widget.js',
    ],
    'auto_install': False,
    'installable': True,
    'web_preload': True,
}
