Web Widget Text Markdown
========================

This module adds a `markdown` widget for the text fields.

It uses `bootstrap-markdown <https://github.com/toopay/bootstrap-markdown>`_
to create an editor on edit mode, and `showdown <https://github.com/showdownjs/showdown>`_
to convert the markdown into HTML while on preview or readonly mode.

- Edit mode:

.. image:: /web_widget_text_markdown/static/src/img/demo_editor.png
   :alt: Edit mode

- Preview mode:

.. image:: /web_widget_text_markdown/static/src/img/demo_preview.png
   :alt: Preview mode

Usage
=====

Add the markdown widget attribute to any text field like so:

.. code-block::

   <field name="textfield" widget="markdown"/>

Supports translatable fields, and all views (form, tree, kanban...).

Credits
=======

This module was inspired by original module at version 10.0 located at:

https://github.com/OCA/web/tree/10.0/web_widget_text_markdown#credits

Contributors
------------

- Tomas Alvarez <tomas@vauxoo.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization
whose mission is to support the collaborative development of
Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
