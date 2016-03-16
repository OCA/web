.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

========================
Web One2many List Action
========================

This module extends the list view used for one2many fields inside form views to
use the 'tree_but_open' interface to define actions for rows.

To use this just specify a 'tree_but_open' action on the target model of the
one2many field relation.

Example
::

    <!-- server action retrieves ir.actions.act_window to open row specific popup -->
    <record model="ir.actions.server" id="message_index_list_view_delegate_open">
        <field name="name">message_index_list_view_delegate_open</field>
        <field name="model_id" ref="model_message_index"/>
        <field name="code">action = object.button_popup_delegate()</field>
    </record>

    <!-- tree_but_open key -- delegates to a server action to execute on row clicked -->
    <record id="message_index_list_view_open" model="ir.values">
        <field name="model">message.index</field>
        <field name="key2">tree_but_open</field>
        <field name="name">message_index_list_view</field>
        <field eval="'ir.actions.server,%d'%message_index_list_view_delegate_open" name="value"/>
        <field name="res_id" eval="0"/>
    </record>

Installation
============

To install this module, just follow basic steps to install an Odoo module.


Configuration
=============

No configuration needed.

Usage
=====

To use this module, you need to:

* go to ...

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/web/8.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:web_one2many_list_actionversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Peter Hahn <peter.hahn@initos.com>

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
