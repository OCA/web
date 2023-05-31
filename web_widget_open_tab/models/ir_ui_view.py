# Copyright 2023 Quartile Limited
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def _get_name_field(self, tree):
        if tree.xpath('./field[@name="display_name"]'):
            return tree.xpath('./field[@name="display_name"]')
        return tree.xpath('./field[@name="name"]')

    @api.model
    def fields_view_get(
        self, view_id=None, view_type="form", toolbar=False, submenu=False
    ):
        res = super(Base, self).fields_view_get(
            view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu
        )
        arch = etree.fromstring(res["arch"])
        model = self.env["ir.model"]._get(self._name)
        if view_type == "tree" and model.add_open_tab_field:
            id_elem = """<field name="id" widget="open_tab" nolabel="1"/>"""
            id_elem = etree.fromstring(id_elem)
            tree = arch.xpath("//tree")[0]
            name_field = self._get_name_field(tree)
            if name_field:
                tree = arch.xpath("//tree")[0]
                tree.insert(name_field[0].getparent().index(name_field[0]) + 1, id_elem)
            else:
                tree.insert(0, id_elem)
        res["arch"] = etree.tostring(arch)
        return res
