.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Usage
========


In the view declaration, put widget='tolocalestring' and tolocalestring='...' attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="field1" widget="tolocalestring" tolocalestring="['fr-FR', { minimumFractionDigits:: 2 }]" />
            <field name="field2" widget="tolocalestring" tolocalestring="['fr-FR', { style: 'currency', currency: 'EUR'}]" />
            <field name="field3" widget="tolocalestring" tolocalestring="['fr-FR', { style: 'currency', currency: 'EUR'}, 'clears_zero']" />
            ...
        </tree>
    </field>
    ...


All options  : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString



Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.



Credits
=======

Contributors
------------
* Tony Galmiche <tony.galmiche@infosaone.com>


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

