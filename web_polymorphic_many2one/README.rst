.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

========================
Web Polymorphic Many2one
========================

Add a new widget named "polymorphic"
The polymorphic field allow to dynamically store an id linked to any model in
Odoo instead of the usual fixed one in the view definition

Installation
============

Configuration
=============


Usage
=====

Python fields declaration:

    model = fields.Char(string='Model')      # ex. 'res.partner'
    object_id = fields.Integer("Resource")   # ex. 42

XML fields declaration:

    <field name="model" invisible="1" />
    <field name="object_id" widget="polymorphic" polymorphic="model" />


Known issues / Roadmap
======================


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Augustin Cisterne-Kaas <augustin.cisterne-kaas@elico-corp.com>
* Dmytro Katyukha <firemage.dima@gmail.com) (Port to 9.0)


Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
