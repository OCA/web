..  code-block:: python

    msg = self.env['popup.message'].create(
        {
            'model_id': self.env['ir.model'].search([('model', '=', 'res.partner')]).id,
            'field_ids': [(6, 0, self.env['ir.model.fields'].search([('model', '=', 'res.partner')]).ids)],
            'popup_type': 'confirm',
            'title': 'My Title',
            'message': 'Are you sure want to update record?',
        }
    )
    return msg.read()
