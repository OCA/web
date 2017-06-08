# -*- coding: utf-8 -*-

from openerp.osv import fields, orm

class ResLang(orm.Model):
    _inherit = 'res.lang'

    def get_placeholder(self, cr, uid, lang_code='en_US'):
        """
        CHECK: need to be improved with other lang about
        formatting years ? 
        """
        to_replace = {"%d": 'dd', "%m": 'mm', "%Y": 'YYYY'}
        ids = self.search(cr, uid, [('code', '=', lang_code)])
        lang_data = self.read(cr, uid, ids, ['date_format'])
        date_format = lang_data[0]['date_format']
        for k, v in to_replace.items():
            date_format = date_format.replace(k, v)
        return date_format
        
