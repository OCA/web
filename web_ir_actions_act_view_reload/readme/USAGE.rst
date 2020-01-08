To use this functionality you need to return following action:

.. code-block:: python

      @api.multi
      def foo():
         self.ensure_one()
         return {
            'type': 'ir.actions.act_view_reload',
         }
