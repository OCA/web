.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
      :alt: License: AGPL-3

===============================================
Web M2X Options
===============================================

This modules extends "many2one" and "many2manytags" form widgets so as to support some new display
control options.

**New: support many2manytags widget !**

**New: support global option management with ir.config_parameter !**

Options provided includes possibility to remove "Create..." and/or "Create and
Edit..." entries from many2one drop down. You can also change default number of
proposition appearing in the drop-down. Or prevent the dialog box poping in
case of validation error.

If not specified, the module will avoid proposing any of the create options
if the current user have no permission rights to create the related object.


Installation
============

To install this module, you need to:

#. Add the module to your addons path a got install it from Application Menu.

Configuration
=============

New options
-----------

``create`` *boolean* (Default: depends if user have create rights)

  Whether to display the "Create..." entry in dropdown panel.

``create_edit`` *boolean* (Default: depends if user have create rights)

  Whether to display "Create and Edit..." entry in dropdown panel

``m2o_dialog`` *boolean* (Default: depends if user have create rights)

  Whether to display the many2one dialog in case of validation error.

``limit`` *int* (Default: Odoo default value is ``7``)

  Number of displayed record in drop-down panel

``search_more`` *boolean* 

  Used to force disable/enable search more button.
  
``field_color`` *string*

  A string to define the field used to define color.
  This option has to be used with colors.
  
``colors`` *dictionary*

  A dictionary to link field value with a HTML color.
  This option has to be used with field_color.
  


ir.config_parameter options
---------------------------

Now you can disable "Create..." and "Create and Edit..." entry for all widgets in the odoo instance.
If you disable one option, you can enable it for particular field by setting "create: True" option directly on the field definition.

``web_m2x_options.create`` *boolean* (Default: depends if user have create rights)

  Whether to display the "Create..." entry in dropdown panel for all fields in the odoo instance.

``web_m2x_options.create_edit`` *boolean* (Default: depends if user have create rights)

  Whether to display "Create and Edit..." entry in dropdown panel for all fields in the odoo instance.

``web_m2x_options.m2o_dialog`` *boolean* (Default: depends if user have create rights)

  Whether to display the many2one dialog in case of validation error for all fields in the odoo instance.

``web_m2x_options.limit`` *int* (Default: Odoo default value is ``7``)

  Number of displayed record in drop-down panel for all fields in the odoo instance

``web_m2x_options.search_more`` *boolean* (Default: default value is ``False``)

  Whether the field should always show "Search more..." entry or not.

Usage
=====

To add these parameters:
#. Go to:  Configuration -> Technical -> Parameters -> System Parameters and add new parameters like:

- web_m2x_options.create: False
- web_m2x_options.create_edit: False
- web_m2x_options.m2o_dialog: False
- web_m2x_options.limit: 10
- web_m2x_options.search_more: True


Example
-------

#. Your XML form view definition could contain::

    ...
    <field name="partner_id" options="{'limit': 10, 'create': false, 'create_edit': false, 'search_more':true 'field_color':'state', 'colors':{'active':'green'}}"/>
    ...

Note
----

Double check that you have no inherited view that remote ``options`` you set on a field !
If nothing work, add a debugger in the first line of ``get_search_result method`` and enable debug mode in Odoo.
When you write something in a many2one field, javascript debugger should pause. If not verify your installation.


.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/{repo_id}/{branch}

.. 162
.. branch is "9.0"

Known issues / Roadmap
======================

* Manage Favorites to show the last selected choices.
* Many2many tags clickable.
* restrict  users form changing tags colors.

Credits
=======

Images
------

* Odoo Community Association: `Icon
  <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.


Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
      :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
