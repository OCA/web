.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

============
Web Flex Nav
============

This module adds a dynamic navigation that contains the smart buttons in the backend views. The need came from having
a better use of the space.

The javascript implementation is strongly based on https://github.com/352Media/flexMenu

Usage
=====

To avoid having all content pushed down, we replace the smart buttons to have one full width line on top of the view, 
instead of having them floating on the right.
We replace the existing odoo smart buttons with the code snippet that contains the JavaScript classes (done 
as example with the res_partner.xml view).

This is an example extending the Partner form view:

    ...
        <div name="buttons" position="replace" />
        <field name="image" position="before" >
            <div class="oe_button_nav oe_button_box flex menu" name="buttons"> </div>
        </field>
    ...
    

**If any other views with FlexNav is needed, the code has to be replaced with the proper JavaScript classes.**


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Mercedes Scenna <mscenna@bloopark.de>
* Cesar Lage <kaerdsar@gmail.com>

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
