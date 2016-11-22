.. image:: https://img.shields.io/badge/licence-lgpl--3-blue.svg
   :target: http://www.gnu.org/licenses/LGPL-3.0-standalone.html
   :alt: License: LGPL-3

======================
Kanban - Stage Support
======================

This module provides a stage model compatible with Kanban views and the 
standard views needed to manage these stages. It also provides the 
``web.kanban.abstract`` model, which can be inherited to add support for 
Kanban views with stages to any other model. Lastly, it includes a base Kanban 
view that can be extended as needed.

Installation
============

To install this module, simply follow the standard install process.

Configuration
=============

No configuration is needed or possible.

Usage
=====

* Inherit from ``web.kanban.abstract`` to add Kanban stage functionality to 
  the child model:

  .. code-block:: python

    class MyModel(models.Model):
        _name = 'my.model'
        _inherit = 'web.kanban.abstract'
        
* Extend the provided base Kanban view (``web_kanban_abstract_view_kanban``) 
  as needed by the child model. The base view has four ``name`` attributes 
  intended to provide convenient XPath access to different parts of the Kanban 
  card. They are ``card_dropdown_menu``, ``card_header``, ``card_body``, and 
  ``card_footer``:

  .. code-block:: xml

    <record id="my_model_view_kanban" model="ir.ui.view">
        <field name="name">My Model - Kanban View</field>
        <field name="model">my.model</field>
        <field name="inherit_id" ref="web_kanban_stage.web_kanban_abstract_view_kanban"/>
        <field name="arch" type="xml">
            <xpath expr="//div[@name='card_header']">
                <!-- Add header content here -->
            </xpath>
            <xpath expr="//div[@name='card_body']">
                <!-- Add body content here -->
            </xpath>
        </field>
    </record>

* To manage stages, go to Settings > Technical > Kanban > Stages.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/9.0

Known Issues / Roadmap
======================

* The grouping logic used by ``web.kanban.abstract`` currently does not 
  support additional domains and alternate sort orders

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_. In 
case of trouble, please check there if your issue has already been reported. 
If you spotted it first, help us smash it by providing detailed and welcomed 
feedback.

Credits
=======

Images
------

* Odoo Community Association: 
  `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Dave Lasley <dave@laslabs.com>
* Oleg Bulkin <obulkin@laslabs.com>
* Daniel Reis

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
