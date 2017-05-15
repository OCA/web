# -*- coding: utf-8 -*-
# Copyright 2017 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import api, models


class WebEnvironmentRibbonBackend(models.Model):

    _name = 'web.environment.ribbon.backend'
    _description = 'Web Environment Ribbon Backend'

    @api.model
    def get_environment_ribbon(self):
        """
        This method returns the ribbon data from ir config parameters
        :return: dictionary
        """
        ir_config_model = self.env['ir.config_parameter']
        # Add the database name to the ribbon name
        db_name = self.env.cr.dbname
        name = u"{name}<br/>({db_name})".format(
            name=ir_config_model.get_param('ribbon.name'), db_name=db_name)
        return {
            'name': name,
            'color': ir_config_model.get_param('ribbon.color'),
            'background_color': ir_config_model.get_param(
                'ribbon.background.color'),
        }
