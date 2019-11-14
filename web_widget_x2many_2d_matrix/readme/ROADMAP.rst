* It would be worth trying to instantiate the proper field widget and let it render the input
* Let the widget deal with the missing values of the full Cartesian product,
  instead of being forced to pre-fill all the possible values.
* If you pass values with an onchange, you need to overwrite the model's method
  `onchange` for making the widget work:

.. code-block:: python

  @api.multi
  def onchange(self, values, field_name, field_onchange):
      if "one2many_field" in field_onchange:
          for sub in [<field_list>]:
              field_onchange.setdefault("one2many_field." + sub, u"")
      return super(model, self).onchange(values, field_name, field_onchange)

