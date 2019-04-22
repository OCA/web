This module was written to allow developers to fine tune available actions in
form and tree views.

Odoo by default supports:

::

   <tree delete="false" create="false">

with this module you can do:

::

   <tree delete="state=='draft'">

Further, you can use `_group_refs` to make a condition based on the user's
groups:

::

   <form delete="'base.group_user' in _group_refs">

You also have access to ``_context`` for the current context. This way, you can
for example craft actions that pass a context key which decides if some of the
action buttons are shown.

Note that for tree views, this will not work on a per record base, and the
values you have access to are the values of the form the x2many field is in.

You do however have access to ``_context`` and ``_group_refs`` in for the
actions of standalone tree views.
