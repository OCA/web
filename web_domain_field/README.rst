.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

================
Web Domain Field
================

When you define a view you can specify on the relational fields a domain
attribute. This attribute is evaluated as filter to apply when displaying
existing records for selection.

.. code-block:: xml

   <field name="product_id" domain="[('type','=','product')]"/>

The value provided for the domain attribute must be a string representing a
valid Odoo domain. This string is evaluated on the client side in a
restricted context where we can reference as right operand the values of
fields present into the form and a limited set of functions.

In this context it's hard to build complex domain and we are facing to some
limitations as:

 * The syntax to include in your domain a criteria involving values from a
   x2many field is complex.
 * The right side of domain in case of x2many can involve huge amount of ids
   (performance problem).
 * Domains computed by an onchange on an other field are not recomputed when
   you modify the form and don't modify the field triggering the onchange.
 * It's not possible to extend an existing domain. You must completely redefine
   the domain in your specialized addon
 * ...

In order to mitigate these limitations this new addon allows you to use the
value of a field as domain of an other field in the xml definition of your
view.

.. code-block:: xml

   <field name="product_id_domain" invisible="1"/>
   <field name="product_id" domain="product_id_domain"/>

The field used as domain must provide the domain as a JSON encoded string.

.. code-block:: python

   product_id_domain = fields.Char(
       compute="_compute_product_id_domain",
       readonly=True,
       store=False,
   )

   @api.multi
   @api.depends('name')
   def _compute_product_id_domain(self):
       for rec in self:
           rec.product_id_domain = json.dumps(
               [('type', '=', 'product'), ('name', 'like', rec.name)]
           )


Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0



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

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Laurent Mignon <laurent.mignon@acsone.eu>
* Denis Roussel <denis.roussel@acsone.eu>

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
