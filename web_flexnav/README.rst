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

You should move the smart buttons to one line on top of the view, instead of floating on the right since when 
the number of buttons increases, the content taht follows in the same view is pushed further down.
You replace the existing smart buttons with the code snippet that have the JavaScript classes (done 
in res_partner.xml). 

This is an example extending the Partner form view:

    ...
        <div name="buttons" position="replace" />
        <field name="image" position="before" >
            <div class="oe_button_nav oe_button_box flex menu" name="buttons"> </div>
        </field>
    ...


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed `feedback
<https://github.com/OCA/
web/issues/new?body=module:%20
web_flexnav%0Aversion:%20
9.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

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
