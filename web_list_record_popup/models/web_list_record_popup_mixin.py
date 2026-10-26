# Copyright 2026-TODAY Akretion - Raphael Valyi <raphael.valyi@akretion.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

from lxml import etree

from odoo import api, models


class WebListRecordPopupMixin(models.AbstractModel):
    """Mixin to inject popup button into form views.

    Models inheriting from this mixin can define:
    - _popup_button_xpaths: List of tuples (xpath, position) where to inject the button

    Example:
        _popup_button_xpaths = [
            (
                "//field[@name='invoice_line_ids']/list/field[@name='product_id']",
                "before"
            ),
        ]
    """

    _name = "web_list_record_popup.mixin"
    _description = "Mixin to inject popup button into form views"

    _popup_button_xpaths = []

    @api.model
    def _get_view(self, view_id=None, view_type="form", **options):
        arch, view = super()._get_view(view_id, view_type, **options)

        if view_type == "form" and self._popup_button_xpaths:
            arch = self._inject_popup_buttons(arch, self._popup_button_xpaths)

        return arch, view

    @api.model
    def _inject_popup_buttons(self, arch, _popup_button_xpaths):
        """Inject popup button before specified fields in list views inside forms."""
        for xpath_expr, position in _popup_button_xpaths:
            try:
                nodes = arch.xpath(xpath_expr)
                for node in nodes:
                    button = etree.Element("button")
                    button.set("name", "dummy_button_for_js")
                    button.set("icon", "fa-external-link")
                    button.set("title", "Edit in Form")
                    button.set("class", "btn-sm btn-link p-0 edit-line-popup")

                    if position == "before":
                        node.addprevious(button)
                    elif position == "after":
                        node.addnext(button)
                    elif position == "inside":
                        node.insert(0, button)
            except Exception:
                # If xpath fails, skip this injection
                continue

        return arch
