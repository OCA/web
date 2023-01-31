# Copyright 2023 Sunflower IT
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import logging

from odoo import models, api

_logger = logging.getLogger(__name__)


class ResCompany(models.Model):
    _inherit = 'res.company'

    @api.model
    def get_ir_config_param_data(self, key):
        try:
            self.env.cr.execute("select value from ir_config_parameter where "
                                "key='%s';" % key)
            res = self.env.cr.fetchone()
        except Exception as e:
            _logger.error('\n\n ERROR: %s \n\n', e)
            return ''
        else:
            if res:
                return '%s' % res
            return ''



