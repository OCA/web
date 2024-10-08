To use this functionality you need to return following action with list of actions to
execute:

.. code-block:: python

    @api.model
    def _auto_print_on_validate(self, pickings, other_action=False):
        action = self.env.ref("stock.action_report_delivery").report_action(pickings.ids, config=False)
        action_cleaned = clean_action(action, self.env)
        return {
            'type': 'ir.actions.client',
            'tag': 'do_multi_print',
            'params': {
                'reports': [action_cleaned],
                'anotherAction': other_action,
            }
        }
