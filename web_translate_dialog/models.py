# Copyright 2019 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo import models, api


class BaseModel(models.BaseModel):

    _inherit = 'base'

    @api.multi
    def get_field_translations(self, field_name):
        """Get only the existing translations for specified field

        :param field_name: Name of the field
        :return: dict of
            {self.id: {'lang_code': (ir.translation,id, ir.translation,value)}}
        """
        read_res = self.with_context(lang='en_US').read(fields=[field_name])
        res = {
            rec.get('id'): {'en_US': (0, rec.get(field_name))}
            for rec in read_res
        }
        for rec_id, values in res.items():
            tr_read_res = self.env['ir.translation'].search_read([
                ('name', '=', '%s,%s' % (self._name, field_name)),
                ('res_id', '=', rec_id)
            ])
            for tr_res in tr_read_res:
                if tr_res.get('lang') == 'en_US':
                    continue
                values[tr_res.get('lang')] = (
                    tr_res.get('id'), tr_res.get('value')
                )
        return res
