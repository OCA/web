To use this functionality you need to return following action to execute:

.. code-block:: python

      def foo():
         self.ensure_one()
         return {
            'type': 'ir.actions.act_export',
            'context': {
                'active_model': 'my.foo.model',   # your model
                'active_ids': self.my_foo_model_ids.ids  # list of ids of the specified active_model to export
            }
         }
