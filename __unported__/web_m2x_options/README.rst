==================================
Add new options for many2one field
==================================


Description
-----------

This modules modifies "many2one" form fields so as to add some new display
control options.

** New: support many2manytags widget ! **

Options provided includes possibility to remove "Create..." and/or "Create and
Edit..." entries from many2one drop down. You can also change default number of
proposition appearing in the drop-down. Or prevent the dialog box poping in
case of validation error.

If not specified, the module will avoid proposing any of the create options
if the current user have no permission rights to create the related object.


Requirements
------------

Was tested on openerp v7.0


New option
----------

``create`` *boolean* (Default: depends if user have create rights)

  Whether to display the "Create..." entry in dropdown panel.

``create_edit`` *boolean* (Default: depends if user have create rights)

  Whether to display "Create and Edit..." entry in dropdown panel

``m2o_dialog`` *boolean* (Default: depends if user have create rights)

  Whether to display the many2one dialog in case of validation error.

``limit`` *int* (Default: openerp default value is ``7``)

  Number of displayed record in drop-down panel


Example
-------

Your XML form view definition could contain::

    ...
    <field name="partner_id" options="{'limit': 10, 'create': false, 'create_edit': false}"/>
    ...

Note
----

Double check that you have no inherited view that remote ``options`` you set on a field ! 
If nothing work, add a debugger in the first ligne of ``get_search_result method`` and enable debug mode in OpenERP. When you write something in a many2one field, javascript debugger should pause. If not verify your installation.

