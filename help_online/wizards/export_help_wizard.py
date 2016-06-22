# -*- coding: utf-8 -*-
# Copyright 2014 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging
import base64
import time
import copy
import urlparse
from werkzeug.routing import Map, Rule
from lxml import etree as ET
from openerp import models, fields, api, exceptions
from openerp.tools.translate import _
from openerp.addons.web.controllers.main import Binary
from openerp.addons.website.controllers.main import WebsiteBinary

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

    binary = Binary()
    websiteBinary = WebsiteBinary()

    img_url_map = Map([
        Rule('/web/image'),
        Rule('/web/image/<string:xmlid>'),
        Rule('/web/image/<string:xmlid>/<string:filename>'),
        Rule('/web/image/<string:xmlid>/<int:width>x<int:height>'),
        Rule('/web/image/<string:xmlid>/<int:width>x<int:height>/'
             '<string:filename>'),
        Rule('/web/image/<string:model>/<int:id>/<string:field>'),
        Rule('/web/image/<string:model>/<int:id>/<string:field>/'
             '<string:filename>'),
        Rule('/web/image/<string:model>/<int:id>/<string:field>/'
             '<int:width>x<int:height>'),
        Rule('/web/image/<string:model>/<int:id>/<string:field>/'
             '<int:width>x<int:height>/<string:filename>'),
        Rule('/web/image/<int:id>'),
        Rule('/web/image/<int:id>/<string:filename>'),
        Rule('/web/image/<int:id>/<int:width>x<int:height>'),
        Rule('/web/image/<int:id>/<int:width>x<int:height>/<string:filename>'),
        Rule('/web/image/<int:id>-<string:unique>'),
        Rule('/web/image/<int:id>-<string:unique>/<string:filename>'),
        Rule('/web/image/<int:id>-<string:unique>/<int:width>x<int:height>'),
        Rule('/web/image/<int:id>-<string:unique>/<int:width>x<int:height>'
             '/<string:filename>'),
        Rule('/website/image'),
        Rule('/website/image/<xmlid>'),
        Rule('/website/image/<xmlid>/<int:width>x<int:height>'),
        Rule('/website/image/<xmlid>/<field>'),
        Rule('/website/image/<xmlid>/<field>/<int:width>x<int:height>'),
        Rule('/website/image/<model>/<id>/<field>'),
        Rule('/website/image/<model>/<id>/<field>/<int:width>x<int:height>')
    ])

    def _manage_images_on_page(self, page_node, data_node, exported_resources):
        """
            - Extract images from page and generate an xml node
            - Replace db id in url with xml id
        """
        img_model = 'ir.attachment'
        urls = self.img_url_map.bind("dummy.org", "/")
        for img_elem in page_node.iter('img'):
            img_src = img_elem.get('src')
            parse_result = urlparse.urlparse(img_src)
            path = parse_result.path
            query_args = parse_result.query
            if urls.test(parse_result.path, "GET"):
                endpoint, kwargs = urls.match(path, "GET",
                                              query_args=query_args)
                kwargs.update(dict(urlparse.parse_qsl(query_args)))
                image = None
                # get the binary object
                xml_id = kwargs.get('xmlid')
                if xml_id:
                    image = self.env.ref(xml_id, False)
                else:
                    _id = kwargs.get('id')
                    model = kwargs.get('model', 'ir.attachment')
                    if _id and model:
                        _id, _, unique = str(_id).partition('_')
                        image = self.env[model].browse(int(_id))
                if (not image or
                    not image.exists() or
                        image._name != img_model):
                    raise exceptions.UserError(
                        _('Only images from ir.attachment are supported when '
                          'exporting help pages'))
                exported_data = image.export_data(
                    ['id',
                     'datas',
                     'datas_fname',
                     'name',
                     'res_model',
                     'mimetype'],
                    raw_data=False)['datas'][0]
                xml_id = exported_data[0]
                new_src = '/web/image/%s' % xml_id
                img_elem.attrib['src'] = new_src
                if xml_id in exported_resources:
                    continue
                img_node = ET.SubElement(
                    data_node,
                    'record',
                    attrib={'id': xml_id,
                            'model': image._name})
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'datas'})
                field_node.text = str(exported_data[1])
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'datas_fname'})
                field_node.text = exported_data[2]
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'name'})
                field_node.text = exported_data[3]
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'res_model'})
                field_node.text = exported_data[4]
                field_node = ET.SubElement(img_node,
                                           'field',
                                           attrib={'name': 'mimetype'})
                field_node.text = exported_data[5]
                data_node.append(img_node)
                exported_resources.add(xml_id)

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

        ir_ui_views = self.env['ir.ui.view'].search(domain, order='name')
        xml_to_export = ET.Element('openerp')
        data_node = ET.SubElement(xml_to_export, 'data')
        exported_resources = set()
        for ir_ui_view in ir_ui_views:
            parser = ET.XMLParser(remove_blank_text=True)
            root = ET.XML(ir_ui_view.arch, parser=parser)
            root.tag = 'template'
            xml_id = self._get_ir_ui_view_xml_id(
                ir_ui_view, root.attrib.pop('t-name'))
            root.attrib['name'] = ir_ui_view.name.replace('website.', '')
            root.attrib['id'] = xml_id
            root.attrib['page'] = 'True'

            self._manage_images_on_page(root, data_node, exported_resources)
            self._clean_href_urls(root, page_prefix, template_prefix)
            data_node.append(root)

            if root.attrib['name'].startswith(template_prefix):
                snippet = self._generate_snippet_from_template(root,
                                                               xml_id,
                                                               template_prefix)
                data_node.append(snippet)

        if len(ir_ui_views) > 0:
            return ET.tostring(xml_to_export, encoding='utf-8',
                               xml_declaration=True,
                               pretty_print=True)
        else:
            return False

    @api.model
    def _get_ir_ui_view_xml_id(self, ir_ui_view, template_name):
        """This method check if an xml_id exists for the given ir.ui.view
        If no xml_id exists, a new one is created with template name as
        value to ensure that the import of the generated file will update
        the existing view in place of creating new copies.
        """
        ir_model_data = self.sudo().env['ir.model.data']
        data = ir_model_data.search([('model', '=', ir_ui_view._name),
                                     ('res_id', '=', ir_ui_view.id)])
        if data:
            if data[0].module:
                return '%s.%s' % (data[0].module, data[0].name)
            else:
                return data[0].name
        else:
            module, name = template_name.split('.')
            postfix = ir_model_data.search_count(
                [('module', '=', module),
                 ('name', 'like', name)])
            if postfix:
                name = '%s_%s' % (name, postfix)
            ir_model_data.create({
                'model': ir_ui_view._name,
                'res_id': ir_ui_view.id,
                'module': module,
                'name': name,
            })
            return module + '.' + name

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
            'name': _('Export Help'),
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
                backup_file.close()
            except:
                _logger.warning(_('Unable to write autobackup file '
                                  'in given directory: %s'
                                  % autobackup_path))
