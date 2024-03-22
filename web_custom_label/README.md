# Web Custom Label

This module allows to easily modify the labels of a view without any development.

## Customizing Labels

In order to edit a label, you need to:

- Go to `Settings / Translations / Application Terms / Custom Labels`.
- Add a new custom label.
- Refresh your browser session in order to see the new label in your view.

Here is an example for products. We rename the field `Internal Reference` (default_code)
with `SKU`.

![Custom Field List](static/description/custom_field_list.png?raw=true)

Note that we selected 2 models to modify; `Product` and `Product Template`. This means
we are modifying the label for both product templates and variants.

Now, if we go to any for product form view, we get the new label `SKU`.

![Product List](static/description/product_list.png?raw=true)

![Product Form](static/description/product_form.png?raw=true)

custom_field_list.png

## Customizing Placeholers

The module also allows to modify the placeholders of a form view.

Here, we set custom placeholders on the street fields of partners / addresses.

![Placeholder List](static/description/custom_placeholder_list.png?raw=true)

Partners have multiple form views in Odoo.

Here, we did not have to specify which form view to edit. The new placeholders are set
in both the main partner form and the contact address form.

![Partner Form](static/description/partner_form_with_placeholders.png?raw=true)

![Address Form](static/description/address_form_with_placeholders.png?raw=true)

## Customizing Helpers

It is possible to customize a field helper.

![Custom Field Help](static/description/custom_field_help.png?raw=true)

![Contact Field Help](static/description/contact_field_help.png?raw=true)

## Customizing Selection Fields

Fields of type `Selection` can be customized.

In the list view of custom labels, a new position `Selection` and a column `Key` were
added. The `Key` contains the technical value of the selection option to rename.

![Custom Selection Option](static/description/custom_selection_option.png?raw=true)

In the example above, the option `contact` of the field `type` of `res.partner` was
renamed to `Personne` (in french).

In the form view of a contact, the term `Contact` is replaced with `Personne`.

![Partner Contact Type](static/description/partner_contact_type.png?raw=true)

## Customizing Buttons

In order to customize an element of the view that is not a field, we need to target the
element with an Xpath expression.

Let's say we want to customize the stock picking view and change the `VALIDATE` button
to `TRANSFER`.

![Picking Form Before](static/description/picking_form_before.png?raw=true)

We add the custom label using an Xpath expression.

![Picking Custom Label](static/description/picking_custom_label.png?raw=true)

Then, the label is updated on the button.

![Picking Form After](static/description/picking_form_after.png?raw=true)

## Comparison with Odoo Studio

When using Odoo Studio to modify a label, an inherited view is created behind the scene.
Thus, each label added using Odoo Studio is coupled with the code. It adds complexity to
deployments, because if the inherited view changes, the Studio customization may become
incompatible.

Another downside is that when using Studio, you will need to edit every view of your
model. For example, products and partners have multiple form views. If you change one
label, you will need to change at multiple places.

The module `Web Custom Label` does not add additionnal XML. It modifies the view at the
rendering, according to the language of the user. If the inherited view changes, the
system will not fail. You may however end up with a wrong label inside a view and have
to adjust the custom label entry.

## Contributors

- Numigi (tm) and all its contributors (https://bit.ly/numigiens)
