# Copyright 2026 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
"""Convert the Font Awesome icons of the header buttons to the Odoo icon font.

``{'shown_in_panel': {'icon': 'fa-star'}}`` becomes
``{'shown_in_panel': {'icon': 'star', 'iconClass': 'oi-filled'}}`` using the
mapping that Odoo uses to migrate its own icons.

It's an ``end-`` script so the views of the modules updated along with this one
are converted as well.
"""

import logging
import re

from lxml import etree

from odoo import SUPERUSER_ID, api
from odoo.upgrade_code.material_symbols_icons_mapping import FA_TO_MATERIAL

_logger = logging.getLogger(__name__)

# ``'icon': 'fa-star'`` or ``'icon': 'fa fa-star'`` dict entries
ICON_RE = re.compile(
    r"""(?P<kq>['"])icon(?P=kq)\s*:\s*(?P<q>['"])(?P<value>fa[\w\s-]*)(?P=q)"""
)


def _icon_sub(match):
    kq, quote = match.group("kq"), match.group("q")
    fa_name = next(
        (c[3:] for c in match.group("value").split() if c.startswith("fa-")), None
    )
    icon = FA_TO_MATERIAL.get(fa_name)
    if not icon:
        _logger.warning(
            "No icon found for '%s'. It must be changed manually.",
            match.group("value"),
        )
        return match.group(0)
    name, filled = icon
    result = f"{kq}icon{kq}: {quote}{name}{quote}"
    if filled:
        result += f", {kq}iconClass{kq}: {quote}oi-filled{quote}"
    return result


def convert_context(context):
    """Convert the icons of a context string with the `shown_in_panel` key"""
    if not context or "shown_in_panel" not in context:
        return context
    return ICON_RE.sub(_icon_sub, context)


def convert_arch(arch):
    """Convert the icons of the contexts with the `shown_in_panel` key"""
    root = etree.fromstring(arch)
    changed = False
    for node in root.xpath("//*[contains(@context, 'shown_in_panel')]"):
        context = convert_context(node.get("context"))
        if context != node.get("context"):
            node.set("context", context)
            changed = True
    # Inherited views setting the context through `position="attributes"`
    for node in root.xpath(
        "//attribute[@name='context'][contains(text(), 'shown_in_panel')]"
    ):
        context = convert_context(node.text)
        if context != node.text:
            node.text = context
            changed = True
    return etree.tostring(root, encoding="unicode") if changed else arch


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    views = (
        env["ir.ui.view"]
        .with_context(active_test=False, lang="en_US")
        .search([("type", "=", "search"), ("arch_db", "ilike", "shown_in_panel")])
    )
    for view in views:
        arch = convert_arch(view.arch_db)
        if arch != view.arch_db:
            _logger.info("Converting header button icons of view %s", view.key)
            view.arch_db = arch
    filters = (
        env["ir.filters"]
        .with_context(active_test=False)
        .search([("context", "ilike", "shown_in_panel")])
    )
    for ir_filter in filters:
        context = convert_context(ir_filter.context)
        if context != ir_filter.context:
            _logger.info("Converting header button icon of filter %s", ir_filter.id)
            ir_filter.context = context
