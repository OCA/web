# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2015 Therp BV (<http://therp.nl>).
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
import re
from lxml.html import clean
from openerp import models


class CkeditorMonkeypatch(models.AbstractModel):
    _name = 'ckeditor.monkeypatch'
    _description = 'Monkeypatches for CKEditor'

    def _register_hook(self, cr):
        marker = self._name.replace('.', '_')
        if not hasattr(clean, marker) \
                and not hasattr(clean, '_is_image_dataurl'):
            # monkey patch lxml's html cleaner to allow image data urls
            if hasattr(clean, '_is_javascript_scheme'):
                # this is the case in lxml >= 3.3
                _is_javascript_scheme = clean._is_javascript_scheme
                _is_image_dataurl = re.compile(
                    r'^data:image/.+;base64', re.I).search
                clean._is_javascript_scheme = lambda s:\
                    None if _is_image_dataurl(s) else _is_javascript_scheme(s)
            # TODO: do something else for 2.3.1 <= version <= 3.2, before data
            # urls were not cleaned at all
            setattr(clean, marker, True)
        return super(CkeditorMonkeypatch, self)._register_hook(cr)
