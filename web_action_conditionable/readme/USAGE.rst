Odoo by default supports:

::

   <tree delete="false" create="false">

with this module you can do:

::

   <tree delete="state=='draft'" create="state!='sent'">

It works in any tree view, so you can use it in One2many.

Similarly in forms you can write:

::

    <form create="false" delete="false" duplicate="false" edit="false">

and with this module you can do:

::

    <form create="state=='draft'" delete="state!='done'" duplicate="some_field=='some value'" edit="state!='done'">
