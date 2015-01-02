==============================
Add new text field form widget
==============================

Description
-----------

This modules add a new widget for text field in form view on Odoo:

- In readonly mode, it use marked to parse and render to html markdown syntaxe.
- In write mode, use [bootstrap-markdown][1]

[1]: http://www.codingdrama.com/bootstrap-markdown/    "bootstrap-markdown"

Requirements
------------

Was tested on openerp trunk, 8.0 branch.

Example
-------

Your XML form view definition should contain::

    ...
    <field name="description" widget="bootstrap_markdown"/>
    ...

Note / Todo
-----------

- Improve user experience with Odoo specific syntaxe
- Improve user experience with Github specific syntaxe
- Add a working parsed field in tree view
- Add ir.attachment support
- Add images support (with drag'n'drop)
- ...

Thanks to
---------

- Nicolas JEUDY <nicolas@sudokeys.com>

If you have questions, please email one of them, or report issue on github
