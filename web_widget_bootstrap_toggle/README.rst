Replaces boolean Checkbox with Bootstrap Toggle
==================================================

This widget provides all of the functionality of Bootstrap's Toggle widget. All the data-attr parameters can be passed through an options dictionary. For full documentation on all available options go to `<http://www.bootstraptoggle.com/>`_

Installation
============

It was tested on Odoo 8.0 branch. This widget comes with an example which uses the user's active field and replaces it with a toggle. 

Usage
=====

Simply define your boolean field as always. Within your view.xml file pass all attributes through the options dictionary.::

    <field name="myboolean" widget="boolean_switch" options="{'data-on':'Active','data-off':'Inactive','data-onstyle':'primary','data-offstyle':'danger','data-size':'mini'}"/>


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.

Credits
=======

Contributors
------------

* AIM Systems <phillips@aimsystems.ca>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
