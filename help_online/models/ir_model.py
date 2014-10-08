# -*- coding: utf-8 -*-
##############################################################################
#
#    Authors: Cédric Pigeon
#    Copyright (c) 2014 Acsone SA/NV (http://www.acsone.eu)
#    All Rights Reserved
#
#    WARNING: This program as such is intended to be used by professional
#    programmers who take the whole responsibility of assessing all potential
#    consequences resulting from its eventual inadequacies and bugs.
#    End users who are looking for a ready-to-use solution with commercial
#    guarantees and support are strongly advised to contact a Free Software
#    Service Company.
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
from openerp import models, api

from lxml import etree as ET


class ir_model_data(models.Model):
    _inherit = 'ir.model.data'

    @api.model
    def _update(self, model, module, values, xml_id=False, store=True,
                noupdate=False, mode='init', res_id=False):

        if model == 'ir.ui.view':
            parameter_model = self.env['ir.config_parameter']
            page_prefix = parameter_model.get_param('help_online_page_prefix',
                                                    False)
            if page_prefix and xml_id.startswith('website.%s' % page_prefix):
                xml_str = self.manageImageReferences(values['arch'], module)
                values['arch'] = xml_str

        return super(ir_model_data, self)._update(model,
                                                  module,
                                                  values,
                                                  xml_id=xml_id,
                                                  store=store,
                                                  noupdate=noupdate,
                                                  mode=mode,
                                                  res_id=res_id)

    def manageImageReferences(self, xml_str, module):
        parser = ET.XMLParser(remove_blank_text=True)
        root = ET.XML(xml_str, parser=parser)
        img_model = 'ir.attachment'
        for img_elem in root.iter('img'):
            if img_model in img_elem.get('src'):
                img_src = img_elem.get('src')
                try:
                    if '/ir.attachment/' in img_src:
                        fragments = img_src.split('/ir.attachment/')
                        xml_id = fragments[1].split('|')[0]
                        img_src = img_src.replace("|", "_")
                    else:
                        id_pos = img_src.index('id=') + 3
                        xml_id = img_elem.get('src')[id_pos:]

                    img_id = self.get_object_reference(module,
                                                       xml_id)

                    img_elem.attrib['src'] = img_src.replace(xml_id,
                                                             str(img_id[1]))
                except:
                    continue
        return ET.tostring(root, encoding='utf-8', xml_declaration=False)
