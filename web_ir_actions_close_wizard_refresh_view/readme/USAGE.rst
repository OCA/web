Return an action literal with the following type: 'ir.actions.close_wizard_refresh_view'.

For example:

::

    def method_called_by_wizard(self):

      ..
      ..

      return {
          'type': 'ir.actions.close_wizard_refresh_view'
      }
