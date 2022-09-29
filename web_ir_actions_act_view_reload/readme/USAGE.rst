To use this functionality you need to return following action:

.. code-block:: python

      def foo(self):
         self.ensure_one()
         return {
            'type': 'ir.actions.act_view_reload',
         }
