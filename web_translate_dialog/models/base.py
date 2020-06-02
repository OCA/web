# Copyright 2019 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo import models, api


class BaseModel(models.BaseModel):

    _inherit = 'base'

    @api.multi
    def get_field_translations(self, field_names):
        """Get only the existing translations for specified field

        :param field_name: Name of the field
        :return: dict of
            {self.id: {'lang_code': {'field_name':ir.translation,value}}
        """
        read_res = self.with_context(lang='en_US').read(fields=field_names)
        res = {}
        for rec in read_res:
            rec_id = rec.get('id')
            del rec['id']
            res[rec_id] = {'en_US': rec}
        for rec_id, values in res.items():
            for name in field_names:

                tr_read_res = self.env['ir.translation'].search_read([
                    ('name', '=', '%s,%s' % (self._name, name)),
                    ('res_id', '=', rec_id),
                    ('lang', '!=', 'en_US')
                ])
                for tr_res in tr_read_res:
                    if not tr_res.get('lang') in values:
                        values[tr_res.get('lang')] = {}
                    values[tr_res.get('lang')][name] = tr_res.get('value')
        return res
