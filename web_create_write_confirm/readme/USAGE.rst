Create popup.message record. Specify model_id, field_ids (which fields will trigger alert) and other fields.
Put you code into **get_message_informations** or **execute_processing** method of you model.
Return dict (perform read() to get it).
Here is some examples how you can use this module features in your code.

Confirm res.partner change:

..  code-block:: python

    msg = self.env['popup.message'].create(
        {
            'model_id': self.env['ir.model'].search([('model', '=', 'res.partner')]).id,
            'field_ids': [(6, 0, self.env['ir.model.fields'].search([('model', '=', 'res.partner')]).ids)],
            'popup_type': 'confirm',
            'title': 'Warning',
            'message': 'Are you sure want to update record?',
        }
    )
    return msg.read()

Sale order alert:

..  code-block:: python

    msg = self.env['popup.message'].create(
        {
            'model_id': self.env['ir.model'].search([('model', '=', 'sale.order')]).id,
            'field_ids': [(6, 0, self.env['ir.model.fields'].search([('model', '=', 'sale.order')]).ids)],
            'popup_type': 'alert',
            'title': 'Attention',
            'message': 'Sale order was updated.',
        }
    )
    return msg.read()
