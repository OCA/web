# Copyright 2022 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from lxml import etree

from odoo import api, models


class BaseModel(models.BaseModel):
    _inherit = "base"

    def _fields_view_get(
        self, view_id=None, view_type="form", toolbar=False, submenu=False
    ):
        """Remove unused nodes depend on the standalone mode
        This is necessary to avoid problems with duplicated fields
        """
        res = super()._fields_view_get(
            view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu
        )
        is_client_standalone = self.env.context.get("client_standalone", False)
        doc = etree.XML(res["arch"])
        if is_client_standalone:
            for node in doc.xpath("//*[contains(@class, 'oe_pwa_standalone_omit')]"):
                node.getparent().remove(node)
        else:
            for node in doc.xpath("//*[contains(@class, 'oe_pwa_standalone_only')]"):
                node.getparent().remove(node)
        res["arch"] = etree.tostring(doc, encoding="unicode")
        return res

    @api.model
    def load_views(self, views, options=None):
        standalone = options.get("standalone", False) if options else False
        return super(
            BaseModel, self.with_context(client_standalone=standalone)
        ).load_views(views, options=options)
