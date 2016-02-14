.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==============
Web Widget toLocaleString
==============

This module add 'tolocalestring' widget in tree view for formatting numbers or not to display the values 0 : 


.. image:: /web_widget_tolocalestring/static/description/screenshot1.png
    :alt: Screenshot



Installation
============

It was tested on Odoo trunk, 8.0 branch.




Usage
=====

To use this module, you need in the view declaration, put widget='tolocalestring' and tolocalestring='...' attribute in the field tag::

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

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed `feedback
<https://github.com/OCA/
web/issues/new?body=module:%20
web_widget_tolocalestring%0Aversion:%20
8.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Tony Galmiche <tony.galmiche@infosaone.com>


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

