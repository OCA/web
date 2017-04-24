# -*- coding: utf-8 -*-
# Copyright 2014 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import base64
from cStringIO import StringIO
from lxml import etree
import logging
import os

from odoo import api, fields, models
from odoo.tools import convert, misc
from odoo.tools.config import config

_logger = logging.getLogger(__name__)


class XmlImport(convert.xml_import):
    """Override base xml_import to be able to import record with an exported
    xml_id ('__export__.XXX-XXX')
    """

    def _test_xml_id(self, xml_id):
        if '.' in xml_id:
            module, _id = xml_id.split('.')
            if module == '__export__':
                return True
        super(XmlImport, self)._test_xml_id(xml_id)


class ImportHelpWizard(models.TransientModel):
    _name = "import.help.wizard"

    source_file = fields.Binary('Source File')

    @api.multi
    def import_help(self):
        for this in self:
            xmlfile = StringIO(base64.decodestring(this.source_file))
            doc = etree.parse(xmlfile)
            relaxng = etree.RelaxNG(
                etree.parse(
                    os.path.join(config['root_path'], 'import_xml.rng')))
            try:
                relaxng.assert_(doc)
            except Exception:
                _logger.info('The XML file does not fit the required schema !',
                             exc_info=True)
                _logger.info(misc.ustr(relaxng.error_log.last_error))
                raise
            obj = XmlImport(self.env.cr, self._module, idref={}, mode='init',
                            report=None, noupdate=False, xml_filename=None)
            obj.parse(doc.getroot(), mode='init')
