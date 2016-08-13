.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=====================
Web widget radio tree
=====================

This module allows to use input radio in a tree view inside a form, in order to ensure the user marks only one record.

Example: You have a partner company form with many contacts. The contacts are shown in a tree and you want to specify only one as preferred.

Usage
=====

In the view declaration, put widget='radio_tree' attribute in the field tag. The field type should be boolean::

    ...
    <field name="arch" type="xml">
        <form>
            ...
            <field name="name" />
            <field name="contact_ids">
                <tree string="View name">
                    ...
                    <field name="name"/>
                    <field name="preferred" widget="radio_tree"/>
                    ...
                </tree>
            </field>
        </form>
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
web_widget_radio_tree%0Aversion:%20
8.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Cesar Lage <kaerdsar@gmail.com>
* Robert Rübner <rruebner@bloopark.de>

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
