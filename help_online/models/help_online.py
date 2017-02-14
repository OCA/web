# -*- coding: utf-8 -*-
# Copyright 2014 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, exceptions
from openerp.tools.translate import _


class HelpOnline(models.TransientModel):
    _name = 'help.online'

    def _get_view_name(self, model, view_type, domain=None, context=None):
        parameter_model = self.env['ir.config_parameter']
        page_prefix = parameter_model.get_param('help_online_page_prefix',
                                                False)
        if not page_prefix:
            raise exceptions.Warning(_('No page prefix parameter specified !'))
        name = '%s-%s' % (page_prefix, model.replace('.', '-'))
        return name

    def get_existing_pages(self, name, limit=None):
        website = self.env['website']
        return website.search_pages(needle=name, limit=limit)

    def get_page_url(self, model, view_type, domain=None, context=None):
        user_model = self.env['res.users']
        if not user_model.has_group('help_online.help_online_group_reader'):
            return {}
        ir_model = self.env['ir.model']
        description = self.env[model]._description
        res = ir_model.name_search(model, operator='=')
        if res:
            description = res[0][1]
        name = self._get_view_name(model, view_type, domain, context)
        pages = self.get_existing_pages(name, limit=1)
        if pages:
            url = pages[0]['loc']
            if view_type:
                url = url + '#' + view_type
            title = _('Help on %s') % description
            return {'url': url,
                    'title': title,
                    'exists': True}
        elif user_model.has_group('help_online.help_online_group_writer'):
            title = _('Create Help page for %s') % description
            return {'url': 'website/add/%s' % name,
                    'title': title,
                    'exists': False}
        else:
            return {}
