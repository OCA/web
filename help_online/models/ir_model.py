# -*- coding: utf-8 -*-
# Copyright 2014 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, api

from lxml import etree as ET


class IrModelData(models.Model):
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

        return super(IrModelData, self)._update(model,
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
