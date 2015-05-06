Search for x2x records in advanced search
=========================================

Standard behavior in advanced search for one2many, many2many and many2one fields is to do a `name_search`. This is not always satisfactionary as you might want to search for other properties. There might also be cases where you don't exactly know what you're searching for, then a list of possible options is necessary too. This module enables you to have a full search view to select the record in question.

Usage
=====

To use this module, you need to:

* open the advanced search options in a search view
* select a one2many, many2many or many2one field
* select operator `is equal to` or `is not equal to`
* the textfield changes to a many2one selection field where you can search for the record in question
* to select multiple records, add another condition for the same field before applying the conditions (that's standard behavior)

For further information, please visit:

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================

* from what we have now, it shouldn't be too difficult to add an operator `use condition`, show a search view for the field's model and use the domain filled in there. This way we can have conditions like `[('journal_id.user_id.groups_id.name', '=', 'test')]`

Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
    :alt: Odoo Community Association
    :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
