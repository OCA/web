# -*- coding: utf-8 -*-
##############################################################################
#
#    Authors: Cédric Pigeon
#    Copyright (c) 2014 Acsone SA/NV (http://www.acsone.eu)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
import logging
import base64
import time
import copy

from lxml import etree as ET
from xml.dom import minidom as minidom
from openerp import models, fields, api, exceptions
from openerp.tools.translate import _

_logger = logging.getLogger(__name__)

PAGE_PREFIX_PARAMETER = 'help_online_page_prefix'
TEMPLATE_PREFIX_PARAMETER = 'help_online_template_prefix'
AUTOBACKUP_PARAMETER = 'help_online_autobackup_path'
HELP_ONLINE_SNIPPET_IMAGE_PATH = '/help_online/static/src/'\
                                 'img/snippet/snippet_thumbs.png'


class ExportHelpWizard(models.TransientModel):
    _name = "export.help.wizard"
    _description = 'Export Help Online'

    data = fields.Binary('XML', readonly=True)
    export_filename = fields.Char('Export XML Filename', size=128)

    def _manage_images_on_page(self, page_node, data_node):
        """
            - Extract images from page and generate a xml node
            - Replace db id in url with xml id
        """

        def substitute_id_by_xml_id(img_elem):
            new_src = False
            attach_id = False
            img_src = img_elem.get('src')
            if 'id=' in img_src:
                id_pos = img_src.index('id=') + 3
                attach_id = img_elem.get('src')[id_pos:]
                new_src = img_src.replace(attach_id, xml_id)
            else:
                fragments = img_src.split('ir.attachment/')
                attach_id, trail = fragments[1].split('_', 1)
                new_src = "/website/image/ir.attachment/%s|%s" % \
                    (xml_id, trail)
            return new_src, attach_id

        i_img = 0
        img_model = 'ir.attachment'
        for img_elem in page_node.iter('img'):
            if img_model in img_elem.get('src'):
                i_img += 1
                xml_id = "%s_img_%s" % \
                    (page_node.attrib['name'], str(i_img).rjust(2, '0'))

                new_src, attach_id = substitute_id_by_xml_id(img_elem)

                if not attach_id:
                    continue

                image = self.env[img_model].browse(int(attach_id))
                if not image:
                    continue

                img_elem.attrib['src'] = new_src
                img_node = ET.SubElement(data_node,
                                         'record',
                                         attrib={'id': xml_id,
                                                 'model': img_model})
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'datas'})
                field_node.text = str(image.datas)
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'datas_fname'})
                field_node.text = image.datas_fname
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'name'})
                field_node.text = image.name
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'res_model'})
                field_node.text = image.res_model
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'mimetype'})
                field_node.text = image.mimetype
                data_node.append(img_node)

    def _clean_href_urls(self, page_node, page_prefix, template_prefix):
        """
            Remove host address for href urls
        """
        for a_elem in page_node.iter('a'):
            if not a_elem.get('href'):
                continue
            href = a_elem.get('href')
            if not href.startswith('http'):
                continue
            page_url = '/page/%s' % page_prefix
            template_url = '/page/%s' % template_prefix
            if page_url not in href and template_url not in href:
                continue
            elif page_url in href and template_url not in href:
                pass
            elif page_url not in href and template_url in href:
                page_url = template_url
            else:
                if page_prefix in template_prefix:
                    page_url = template_url
                else:
                    pass

            if page_url:
                trail = href.split(page_url, 1)[1]
                a_elem.attrib['href'] = page_url + trail

    def _generate_snippet_from_template(self, page_node,
                                        template_id, template_prefix):
        """
            Generate a website snippet from a template
        """
        page = copy.deepcopy(page_node)
        snippet = ET.Element('template')
        snippet.attrib['id'] = template_id + '_snippet'
        snippet.attrib['inherit_id'] = 'website.snippets'
        snippet.attrib['name'] = page_node.attrib['name']

        xpath = ET.SubElement(snippet,
                              'xpath',
                              attrib={'expr': "//div[@id='snippet_structure']",
                                      'position': 'inside'})
        main_div = ET.SubElement(xpath,
                                 'div')
        thumbnail = ET.SubElement(main_div,
                                  'div',
                                  attrib={'class': 'oe_snippet_thumbnail'})
        ET.SubElement(thumbnail,
                      'img',
                      attrib={'class': 'oe_snippet_thumbnail_img',
                              'src': HELP_ONLINE_SNIPPET_IMAGE_PATH})
        span = ET.SubElement(thumbnail,
                             'span',
                             attrib={'class': 'oe_snippet_thumbnail_title'})
        span.text = page_node.attrib['name'].replace(template_prefix, '')
        body = ET.SubElement(main_div,
                             'section',
                             attrib={'class': 'oe_snippet_body '
                                              'mt_simple_snippet'})

        template = page.find(".//div[@id='wrap']")

        for node in template.getchildren():
            body.append(node)

        return snippet

    def _get_qweb_views_data(self):
        parameter_model = self.env['ir.config_parameter']
        page_prefix = parameter_model.get_param(PAGE_PREFIX_PARAMETER,
                                                False)
        template_prefix = parameter_model.get_param(TEMPLATE_PREFIX_PARAMETER,
                                                    False)

        if not page_prefix or not template_prefix:
            return False

        domain = [('type', '=', 'qweb'),
                  ('page', '=', True),
                  '|',
                  ('name', 'like', '%s%%' % page_prefix),
                  ('name', 'like', '%s%%' % template_prefix)]

        view_data_list = self.env['ir.ui.view'].search_read(domain,
                                                            ['arch', 'name'],
                                                            order='name')
        xml_to_export = ET.Element('openerp')
        data_node = ET.SubElement(xml_to_export, 'data')

        for view_data in view_data_list:
            parser = ET.XMLParser(remove_blank_text=True)
            root = ET.XML(view_data['arch'], parser=parser)

            root.tag = 'template'
            template_id = root.attrib.pop('t-name')
            root.attrib['name'] = view_data['name'].replace('website.', '')
            root.attrib['id'] = template_id
            root.attrib['page'] = 'True'

            self._manage_images_on_page(root, data_node)
            self._clean_href_urls(root, page_prefix, template_prefix)
            data_node.append(root)

            if root.attrib['name'].startswith(template_prefix):
                snippet = self._generate_snippet_from_template(root,
                                                               template_id,
                                                               template_prefix)
                data_node.append(snippet)

        if len(view_data_list) > 0:
            rough_string = ET.tostring(xml_to_export, encoding='utf-8',
                                       xml_declaration=True)
            reparsed = minidom.parseString(rough_string)
            return reparsed.toprettyxml(indent="  ", encoding='utf-8')
        else:
            return False

    @api.multi
    def export_help(self):
        """
        Export all Qweb views related to help online in a Odoo
        data XML file
        """
        xml_data = self._get_qweb_views_data()
        if not xml_data:
            raise exceptions.Warning(_('No data to export !'))
        out = base64.encodestring(xml_data)

        self.write({'data': out,
                    'export_filename': 'help_online_data.xml'})

        return {
            'name': 'Help Online Export',
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'view_mode': 'form',
            'view_type': 'form',
            'res_id': self.id,
            'views': [(False, 'form')],
            'target': 'new',
        }

    @api.model
    def auto_backup(self):
        """
            Export data to a file on home directory of user
        """
        parameter_model = self.env['ir.config_parameter']
        autobackup_path = parameter_model.get_param(AUTOBACKUP_PARAMETER,
                                                    False)

        if autobackup_path:
            xml_data = self._get_qweb_views_data()
            try:
                timestr = time.strftime("%Y%m%d-%H%M%S")
                filename = '%s/help_online_backup-%s.xml' % (autobackup_path,
                                                             timestr)
                backup_file = open(filename,
                                   'w')
                backup_file.write(xml_data)
                backup_file.close
            except:
                _logger.warning(_('Unable to write autobackup file '
                                  'in given directory: %s'
                                  % autobackup_path))
