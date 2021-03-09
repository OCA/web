Features:
 - This module allows you to add general buttons in list views


For use, the general_buttons key must be defined in the context of the action.
This key contains a list of dictionaries in which each button is defined.
Each button must have an action, a name and a model.

The **name** is displayed on the button and when the button is pressed,
the method defined in **action** from the specified **model** will be executed.

Example:

.. code:: python

  {
    'general_buttons': [{
      'action': "print_pdf",
      'name': "Print Preview",
      'model':'stock.inventory.line'
    }]
  }


.. code:: python

  class StockInventoryLine(models.Model):
    _inherit = "stock.inventory.line"

    def print_pdf()
      ...
