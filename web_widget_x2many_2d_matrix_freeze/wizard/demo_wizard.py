# -*- coding: utf-8 -*-
# Copyright 2020 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models


class WebWidgetX2ManyMatrixDemoWizardLine(models.TransientModel):
    """ Countries vs partners should give us a nice big demo matrix """
    _name = 'web.widget.x2many.matrix.demo.wizard.line'

    wizard_id = fields.Many2one('web.widget.x2many.matrix.demo.wizard')
    country_id = fields.Many2one('res.country')
    country_name = fields.Char(related='country_id.display_name')
    partner_id = fields.Many2one('res.partner')
    partner_name = fields.Char(related='partner_id.display_name')
    projected_sales = fields.Float()


class WebWidgetX2ManyMatrixDemoWizard(models.TransientModel):
    _name = 'web.widget.x2many.matrix.demo.wizard'

    def _default_line_ids(self):
        countries = self.env['res.country'].search([], limit=20)
        partners = self.env['res.partner'].search([], limit=20)
        return [
            (0, 0, {
                'country_id': c.id,
                'country_name': c.display_name,
                'partner_id': p.id,
                'partner_name': p.display_name,
                'projected_sales': 0.0,
            })
            for c in countries
            for p in partners
        ]

    line_ids = fields.One2many(
        'web.widget.x2many.matrix.demo.wizard.line',
        'wizard_id',
        default=_default_line_ids)
