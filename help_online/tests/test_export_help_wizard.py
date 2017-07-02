# -*- coding: utf-8 -*-
# Copyright 2014 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import base64
from lxml import etree as ET

import odoo.tests.common as common
from .common import TestWizardCommon


class TestExportHelpWizard(TestWizardCommon):
    pageName = None
    imgXmlId = None

    def test_export_help(self):
        """
            Export help data
        """
        self.createPage(pageName=self.pageName, imgXmlId=self.imgXmlId)

        wizardPool = self.env['export.help.wizard']
        wizard = wizardPool.create({})
        wizard.export_help()
        xmlData = base64.decodestring(wizard.data)

        parser = ET.XMLParser(remove_blank_text=True)
        rootXml = ET.XML(xmlData, parser=parser)

        xPath = ".//template[@id='__export__.%s']" % self.pageName
        templateNodeList = rootXml.findall(xPath)
        self.assertEqual(len(templateNodeList), 1)
        self.assertNotIn("website.", templateNodeList[0].attrib['name'])
        self.assertEqual(
            "website." + self.pageName, templateNodeList[0].attrib['key'])

        if self.imgXmlId:
            xPath = ".//record[@id='%s']" % self.imgXmlId
            imgNodeList = rootXml.findall(xPath)
            self.assertEqual(len(imgNodeList), 1,
                             'The same image should be exported only once')

            for imgElem in templateNodeList[0].iter('img'):
                imgSrc = imgElem.get('src')
                if '/ir.attachment/' in imgSrc:
                    self.assertIn("/ir.attachment/%s|"
                                  % self.imgXmlId, imgSrc)
                else:
                    self.assertIn("/web/image/%s" % self.imgXmlId, imgSrc)

        if self.pageTemplate:
            xPath = ".//template[@id='__export__.%s_snippet']" % self.pageName
            templateNodeList = rootXml.findall(xPath)
            self.assertEqual(len(templateNodeList), 1)
            self.assertNotIn("website.", templateNodeList[0].attrib['name'])


class TestExportHelpWithImage(TestExportHelpWizard, common.TransactionCase):
    def setUp(self):
        super(TestExportHelpWithImage, self).setUp()
        parameter_model = self.env['ir.config_parameter']
        page_prefix = parameter_model.get_param('help_online_page_prefix')
        self.pageName = '%stest-page' % page_prefix
        self.imgXmlId = '%s.test_img_1' % self._module_ns


class TestExportHelpTemplate(TestExportHelpWizard, common.TransactionCase):
    def setUp(self):
        super(TestExportHelpTemplate, self).setUp()
        parameter_model = self.env['ir.config_parameter']
        param = 'help_online_template_prefix'
        template_prefix = parameter_model.get_param(param)
        self.pageName = '%stest-template' % template_prefix
        self.pageTemplate = True
