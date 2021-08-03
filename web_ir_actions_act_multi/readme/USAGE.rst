To use this functionality you need to return following action with list of actions to execute:

.. code-block:: python

      @api.multi
      def foo():
         self.ensure_one()
         return {
            'type': 'ir.actions.act_multi',
            'actions': [
                {'type': 'ir.actions.act_window_close'},
                {'type': 'ir.actions.act_view_reload'},
            ]
         }
