Context in colors
=================

This addon allows to use the current context in colors, thereby allowing i.e.
search filters changing the colors used in a tree view. This also works for
the fonts attribute.

Usage
=====

You might define a search filter::

<filter name="paid_green" string="Show paid invoices in green" context="{'paid_should_be_green': True}" />

And then you could use::

<tree colors="green:state == 'paid' and context.get('paid_should_be_green')">

in your tree view. Take care here that the first match wins, so order your
color expressions accordingly.

Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
