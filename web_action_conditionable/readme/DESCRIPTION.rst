This module was written to extend the functionality of actions in tree views.
Odoo by default support:

::

   <tree delete="false" create="false">

with this module you can do:

::

   <tree delete="state=='draft'">

you can use `_group_refs` to make a condition based on the user's groups:

::

   <tree delete="'base.group_user' in _group_refs">

It works in any tree view, so you can use it in One2many.
