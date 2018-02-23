# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

from odoo import models, api


class View(models.Model):
    _inherit = 'ir.ui.view'

    @api.model
    def get_graph_nodes_field(self, model, node):
        for model_key, model_value in self.env[model]._fields.items():
            if model_value.type == 'one2many':
                if model_value.comodel_name == node:
                    return model_key
        return False
