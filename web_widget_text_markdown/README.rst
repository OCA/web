Add new text field form widget
==============================

This module adds a new widget for text field in form view on Odoo:

- In readonly mode, it uses text contents to parse and render them to html markdown syntax.
- In write mode, use [bootstrap-markdown][1]

[1]: http://www.codingdrama.com/bootstrap-markdown/    "bootstrap-markdown"

Installation
============

It was tested on openerp trunk, 8.0 branch.

Usage
=====

Your XML form view definition should contain::

    ...
    <field name="field_name" widget="bootstrap_markdown"/>
    ...

Known issues / Roadmap
======================

* Improve user experience with Odoo specific syntax
* Improve user experience with Github specific syntax
* Add a working parsed field in tree view
* Add ir.attachment support
* Add images support (with drag'n'drop)

Credits
=======

Contributors
------------

* Nicolas Jeudy <nicolas@sudokeys.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.

