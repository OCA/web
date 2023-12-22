Web Custom Modifier
===================
This module allows to customize modifiers on form view nodes.

For example, it allows to make a field readonly, invisible or required.

.. contents:: Table of Contents

Usage
-----
As system administrator, I go to `Settings / Technical / User Interface / Custom Modifiers`.

.. image:: static/description/custom_modifier_menu.png

I create a new custom modifier.

.. image:: static/description/new_custom_modifier.png

The modifier is configured to make the field ``default_code`` of a product required.

After refreshing my screen, I go to the form view of a product.

I notice that the field ``default_code`` is required.

.. image:: static/description/product_form.png

Advanced Usage
--------------
In the field ``Type``, I can select ``Xpath``.
This allows to set a modifier for a specific view node, such as a button.

.. image:: static/description/button_modifier.png

The example above hides the a button in the form view of a product.

Hide Selection Item
-------------------
The module allows to hide an item (option) of a selection field.

.. image:: static/description/hide_selection_item_modifier.png

The above example hides the type of address ``Other``.

.. image:: static/description/contact_form_without_selection_item.png

Beware that if the hidden option is already selected on a record,
it will look as it was never set.

.. image:: static/description/contact_form_type_not_selected.png

Therefore, this feature should only be used to hide options that are never used.

Force Save
----------
A new option ``Force Save`` is available.

.. image:: static/description/force_save_modifier.png

This modifier may be used along with the ``Readonly`` modifier so
that the field value is saved to the server.

Excluded Groups
---------------
A new field ``Excluded Groups`` is available.

.. image:: static/description/excluded_groups.png

If at least one group of users is selected, the modifier is not applied for users that are member of any of these groups.

This is useful when rendering an element readonly or invisible only for a subset of users.

Custom Widget
-------------
It is possible to customize the widget used for a given field.

.. image:: static/description/custom_widget.png

.. image:: static/description/task_form_with_custom_widget.png

Optional
--------
Since the version 14.0.2.0.1, it is possible to customize the optional of a given field on tree view.
The Optional  modifier takes 2 possible keys: "show" or "hide",
- "show": To make the fiead displayed by default in the tree view by default.
- "hide": To make the field hidden in the 3 dotes of a tree view by default.

*IMPORTANT: the field must be present by default on the tree view and displayed.*

Example:
As system administrator, I go to `Settings / Technical / User Interface / Custom Modifiers`.
I add the field `name` (label as `Number` in quotation list) of the model `sale.order`.
I select the modifier `Optional` and then set the key `show`. So the field will be shown by default but now,
it is possible now to hide it.

.. image:: static/description/optional_modifier.png

I go to quotation list view, I refresh the page, and now I see the change as wanted.

.. image:: static/description/optional_modifier_applied.png

Number of lines per page (List Views)
-------------------------------------

A new modifier is added to set the number of lines per page in list view.

In the following example, we set a limit of 20 sale order lines per page on a sale order form view.

.. image:: static/description/number_lines_per_page_modifier.png

Result:

.. image:: static/description/sale_order_with_limited_sol_per_page.png

Contributors
------------
* Numigi (tm) and all its contributors (https://bit.ly/numigiens)
