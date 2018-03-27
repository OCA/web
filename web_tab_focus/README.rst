.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

=============
web_tab_focus
=============

This module allows a developer to select which page of a notebook should be
automatically focused, depending on the contents of a field.

Usage
=====

This module is used by adding attributes to the <notebook> and <page> tags of
form views.

For example, if you have a field in your model::

    vehicle = fields.Selection([
        ('bicycle', 'Bicycle'),
        ('motorcycle', 'Motorcycle'),
        ('car', 'Car'),
    ])

And you have a <notebook> in the form view for each vehicle, you can focus on
the appropriate tab automatically using the follow code::

    <!-- the field must be in the view, but it can be invisible -->
    <field name="vehicle"/>
    
    <notebook focus-var="vehicle">
        <page focus-val="bicycle">
            <!-- bicycle specific stuff goes here -->
        </page>
        <page focus-val="car">
            <!-- car specific stuff goes here -->
        </page>
        <page focus-val="motorcycle">
            <!-- motorcycle specific stuff goes here -->
        </page>
    </notebook>

When the record is loaded, the module will compare the value of the field
`vehicle` with the value of each page, and focus on the one that is equal.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://odoo-community.org/logo.png>`_.

Contributors
------------

* André Paramés (ACSONE) <github@andreparames.com>

Do not contact contributors directly about support or help with technical issues.

Funders
-------

The development of this module has been financially supported by:

* ACSONE SA/NV

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
