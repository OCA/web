# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).
import os
import logging

from lxml import etree

from odoo import tools
from odoo.tools import view_validation

_logger = logging.getLogger(__name__)


_relaxng_orig = view_validation.relaxng


def relaxng(view_type):
    """ Return a validator for the given view type, or None. """
    if view_type not in view_validation._relaxng_cache:
        folder = view_type == 'diagram' and 'web_diagram_position' or 'base'
        with tools.file_open(
                os.path.join(folder, 'rng', '%s_view.rng' % view_type)
        ) as frng:
            try:
                relaxng_doc = etree.parse(frng)
                view_validation._relaxng_cache[view_type] = \
                    etree.RelaxNG(relaxng_doc)
            except Exception:
                _logger.exception(
                    'Failed to load RelaxNG XML schema for views validation'
                )
                view_validation._relaxng_cache[view_type] = None
    return view_validation._relaxng_cache[view_type]


view_validation.relaxng = relaxng
