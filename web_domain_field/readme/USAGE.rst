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
 * etc...

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

   @api.depends('name')
   def _compute_product_id_domain(self):
       for rec in self:
           rec.product_id_domain = json.dumps(
               [('type', '=', 'product'), ('name', 'like', rec.name)]
           )
