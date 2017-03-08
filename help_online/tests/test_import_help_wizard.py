# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import base64

import odoo.tests.common as common
from .common import TestWizardCommon


class TestImportHelpWizard(TestWizardCommon, common.TransactionCase):

    def setUp(self):
        super(TestImportHelpWizard, self).setUp()
        self.page_name = "export_import_help"
        self.img_xml_id = '%s.test_img_1' % self._module_ns
        self.img_name = self.env.ref(self.img_xml_id).name
        self.ir_attchement = self.env['ir.attachment']
        self.ir_ui_view = self.env['ir.ui.view']
        self.export_help_wizard = self.env['export.help.wizard']
        self.import_help_wizard = self.env['import.help.wizard']

    def _do_check_resources(self, expected=1):
        pages = self.ir_ui_view.search([('name', '=', self.page_name)])
        self.assertEqual(expected, len(pages))
        attachments = self.ir_attchement.search(
            [('name', '=', self.img_name)])
        self.assertEqual(expected, len(attachments))

    def test_import_help(self):
        self.createPage(pageName=self.page_name, imgXmlId=self.img_xml_id)
        self._do_check_resources()
        wizard = self.export_help_wizard.create({})
        wizard.export_help()
        xmlData = base64.decodestring(wizard.data)
        self.env.ref(self.img_xml_id).unlink()
        self.ir_ui_view.search([('name', '=', self.page_name)]).unlink()
        self._do_check_resources(0)
        wizard = self.import_help_wizard.create({
            'source_file': base64.encodestring(xmlData)
            })
        wizard.import_help()
        self._do_check_resources()

    def test_import_export_help(self):
        """Check that exported data are not ducplicated by export / import
        """
        self.createPage(pageName=self.page_name, imgXmlId=self.img_xml_id)
        self._do_check_resources()
        # export
        wizard = self.export_help_wizard.create({})
        wizard.export_help()
        xmlData = base64.decodestring(wizard.data)
        self._do_check_resources()
        wizard = self.import_help_wizard.create({
            'source_file': base64.encodestring(xmlData)
            })
        wizard.import_help()
        self._do_check_resources()
