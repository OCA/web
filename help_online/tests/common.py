# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import os
import sys
from lxml import etree as ET

from openerp.tools.convert import convert_xml_import


class TestWizardCommon(object):
    _data_files = ('data/help_test_data.xml',)

    _module_ns = 'help_online'

    def createPage(self, pageName, imgXmlId=False):
        imgId = False
        if imgXmlId:
            imgId = self.ref(imgXmlId)

        rootNode = ET.Element('t')
        rootNode.attrib['name'] = pageName
        rootNode.attrib['t-name'] = "website.%s" % pageName
        tNode = ET.SubElement(rootNode,
                              't',
                              attrib={'t-call': 'website.layout'})
        structDivNode = ET.SubElement(tNode,
                                      'div',
                                      attrib={'class': 'oe_structure oe_empty',
                                              'id': 'wrap'})
        sectionNode = ET.SubElement(structDivNode,
                                    'section',
                                    attrib={'class': 'mt16 mb16'})
        containerNode = ET.SubElement(sectionNode,
                                      'div',
                                      attrib={'class': 'container'})
        rowNode = ET.SubElement(containerNode,
                                'div',
                                attrib={'class': 'row'})
        bodyDivNode = ET.SubElement(rowNode,
                                    'div',
                                    attrib={'class': 'col-md-12 '
                                                     'text-center mt16 mb32'})
        style = "font-family: 'Helvetica Neue', Helvetica,"\
                " Arial, sans-serif; color: rgb(51, 51, 51);"\
                " text-align: left;"
        h2Node = ET.SubElement(bodyDivNode,
                               'h2',
                               attrib={'style': style})
        h2Node.text = "Test Sample Title"
        if imgId:
            imgDivNode = ET.SubElement(bodyDivNode,
                                       'div',
                                       attrib={'style': 'text-align: left;'})
            src = "/website/image?field=datas&"\
                  "model=ir.attachment&id=%s" % str(imgId)
            ET.SubElement(imgDivNode,
                          'img',
                          attrib={'class': 'img-thumbnail',
                                  'src': src})
            imgDivNode = ET.SubElement(bodyDivNode,
                                       'div',
                                       attrib={'style': 'text-align: left;'})
            src = "/website/image/ir.attachment/%s_ccc838d/datas" % str(imgId)
            ET.SubElement(imgDivNode,
                          'img',
                          attrib={'class': 'img-thumbnail',
                                  'src': src})
            imgDivNode = ET.SubElement(bodyDivNode,
                                       'div',
                                       attrib={'style': 'text-align: left;'})
            src = "/web/image/%s" % str(imgId)
            ET.SubElement(imgDivNode,
                          'img',
                          attrib={'class': 'img-thumbnail',
                                  'src': src})
        arch = ET.tostring(rootNode, encoding='utf-8', xml_declaration=False)
        vals = {
            'name': pageName,
            'type': 'qweb',
            'arch': arch,
            'page': True,
        }
        view_id = self.env['ir.ui.view'].create(vals)
        return view_id.id

    def setUp(self):
        super(TestWizardCommon, self).setUp()
        self.pageName = False
        self.imgXmlId = False
        self.pageTemplate = False
        # Loads the data file before
        module = sys.modules[self.__class__.__module__]
        base_path = os.path.dirname(module.__file__)
        for path in self._data_files:
            path = path.split('/')
            path.insert(0, base_path)
            path = os.path.join(*path)
            convert_xml_import(self.cr, self._module_ns, path)
