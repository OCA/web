Add new text field form widget: ACE
===================================

This module adds a new widget for text field in form view on Odoo:

- enable `ace editor <https://ace.c9.io/>`_ in edit mode

Requirements:
=============

It was tested on Odoo 9.0 community and enterprise branch.

Usage
=====

Your XML form view definition should contain::

    ...
    <field name="field_name" widget="ace_editor"/>
    ...

You can pass a set of options for theme and mode::

    ...
    <field name="field_name" widget="ace_editor" data-editor-mode="python" data-editor-theme="chrome"/>
    ...

Defaults:
---------

- data-editor-mode: xml
- data-editor-theme: monokai

Known issues
============

* Need to reimport raphael.js because of the eve not found bug.

Roadmap
=======

* enable auto_complete and snippet
* enable @mention with openchatter
* add js tests

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_widget_text_ace%0Aversion:%209.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


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
