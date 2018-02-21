Add new text field form widget
==============================

This module adds a new widget for text field in form view on Odoo:

- In readonly mode, use `markdown-it parser <https://github.com/markdown-it/markdown-it>`_ to render html.
- In write mode, `ace editor <https://ace.c9.io/>`_ is in action with markdown editor mode.

Installation
============

It was tested on Odoo 9.0c and 9.0e branch.

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
* Improve ace integration with snippet and autocomplete.
* Add preview and fullscreen mode.


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_widget_text_markdown%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Nicolas Jeudy (Sudokeys) <https://www.github.com/njeudy>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
