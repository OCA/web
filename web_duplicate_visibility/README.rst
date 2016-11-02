.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

========================
Web duplicate visibility
========================

This module allows to manage the visibility of duplicate button from the form
view declaration.

Usage
=====

While the default behavior of odoo is to display the duplicate button when user
is allowed to create a new object. You are now able to remove duplicate button
explicitly even if you are able to create new object::

    <record id="view_form_id" model="ir.ui.view">
      <field name="name">view name</field>
      <field name="model">my.model</field>
      <field name="priority" eval="10"/>
      <field name="arch" type="xml">
         <form string="..." duplicate="0">
         ...
         </form>
      </field>
    </record>

or by extending an existing view::

     <field name="arch" type="xml">
         <xpath expr="//form" position="attributes">
             <attribute name="duplicate">0</attribute>
         </xpath>
     </field>


.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/repo/github-com-oca-web-162

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/
  blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Pierre Verkest <pverkest@anybox.fr>
* Christophe Combelles <ccomb@anybox.fr>
* Simon André <sandre@anybox.fr>
* Jairo Llopis <jairo.llopis@tecnativa.com>

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
