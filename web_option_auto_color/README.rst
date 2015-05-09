.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

Web Option Auto Color
=====================

This module was written to offer a new autocolor attribute which can be used on
field in trees view. Using this attribute causes an identical coloration for
cells of the same value in a list view.

Installation
============

To install this module, you need to:

 * Click on install button
 
 Usage
 =====
 
 In the view declaration, put autocolor="1" attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name"/>
            <field name="name2" autocolor="1"/>
            ...
        </tree>
    </field>
    ...
 
Credits
=======

Contributors
------------

* Stéphane Bidoul (ACSONE) <stephane.bidoul@acsone.eu>
* Adrien Peiffer (ACSONE) <adrien.peiffer@acsone.eu>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.