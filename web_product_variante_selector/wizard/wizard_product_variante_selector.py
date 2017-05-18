# -*- coding: utf-8 -*-
from odoo import models, api, fields


class WizardSelectVariante(models.TransientModel):
    _name = 'web.product.variante.selector'
    _description = 'Select Product Variante'

    product_tmpl_id = fields.Many2one('product.template', 'Product', )
    product_id = fields.Many2one('product.product', 'Product Variante', default=lambda self: self.env['product.product'].browse(self.env.context.get('current_product_id', False)).id)
    stop_update = fields.Boolean('Stop_update', default=lambda self: False if self.env.context.get('current_product_id', False) else True, readonly=True)

    attr_0 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_0 = fields.Many2one('product.attribute.value', string='Value')
    attr_1 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_1 = fields.Many2one('product.attribute.value', string='Value')
    attr_2 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_2 = fields.Many2one('product.attribute.value', string='Value')
    attr_3 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_3 = fields.Many2one('product.attribute.value', string='Value')
    attr_4 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_4 = fields.Many2one('product.attribute.value', string='Value')
    attr_5 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_5 = fields.Many2one('product.attribute.value', string='Value')
    attr_6 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_6 = fields.Many2one('product.attribute.value', string='Value')
    attr_7 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_7 = fields.Many2one('product.attribute.value', string='Value')
    attr_8 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_8 = fields.Many2one('product.attribute.value', string='Value')
    attr_9 = fields.Many2one('product.attribute', string='Attribute', readonly=1)
    value_9 = fields.Many2one('product.attribute.value', string='Value')

    @api.onchange('product_id')
    def on_change_product_id(self):
        res = {}
        dom = {}
        vals = {}
        if self.product_id and not self.stop_update:
            vals.update({'product_tmpl_id': self.product_id.product_tmpl_id.id, 'stop_update': True})
            dom.update({'product_id': self.env.context.get('select_variante_domain', [])})
            attributes = self.product_id.product_tmpl_id.attribute_line_ids
            for i in range(0, 10):
                if i < len(attributes):
                    current_value = self.product_id.attribute_value_ids & attributes[i].value_ids
                    vals.update({'attr_%s' % i: attributes[i].attribute_id.id, 'value_%s' % i: current_value[0].id if current_value else False})
                    dom.update({'value_%s' % i: [('id', 'in', attributes[i].value_ids.ids)]})
                else:
                    vals.update({'attr_%s' % i: False})
                    vals.update({'value_%s' % i: False})
            res.update({'value': vals, 'domain': dom, })
            return res

    @api.onchange('product_tmpl_id')
    def on_change_product_tmpl_id(self):
        res = {}
        dom = {}
        vals = {}
        domain = []
        domain.extend(self.env.context.get('select_variante_domain', []))
        if self.stop_update or (not self.stop_update and not self.product_id):
            if self.product_tmpl_id:
                domain.append(('product_tmpl_id', '=', self.product_tmpl_id.id))
                vals.update({'product_id': self.product_id.search(domain, limit=1).id})
                dom.update({'product_id': domain})

                attributes = self.product_tmpl_id.attribute_line_ids
                for i in range(0, 10):
                    vals.update({'value_%s' % i: False})
                    if i < len(attributes):
                        vals.update({'attr_%s' % i: attributes[i].attribute_id.id})
                        dom.update({'value_%s' % i: [('id', 'in', attributes[i].value_ids.ids)]})
                    else:
                        vals.update({'attr_%s' % i: False})
            else:
                vals.update({'product_id': False, })
                for i in range(0, 10):
                    vals.update({'attr_%s' % i: False, 'value_%s' % i: False})

        res.update({'value': vals, 'domain': dom, })
        return res

    @api.onchange('value_0', 'value_1', 'value_2', 'value_3', 'value_4', 'value_5', 'value_6', 'value_7','value_8', 'value_9')
    def onchange_value(self):
        res = {}
        values = []
        domain = self.env.context.get('select_variante_domain', [])
        for i in range(0, 10):
            value = self['value_%s' % i]
            if value:
                values.extend((value.attribute_id.value_ids - value).ids)

        dom = []
        dom.extend(domain)
        dom.append(('product_tmpl_id', '=', self.product_tmpl_id.id))
        if values:
            dom.append(('attribute_value_ids', 'not in', values))

        res_ids = self.product_id.search(dom).ids
        res.update({'value': {'product_id': res_ids[0] if res_ids else False}})
        domain.append(('id', 'in', res_ids))
        res.update({'domain': {'product_id': domain}})
        return res
