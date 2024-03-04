# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import re

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class IrUiViewMergeNotebookTab(models.Model):
    _name = "ir.ui.view.merge.notebook.tab"
    _description = "Merge Notebook Tab Settings"

    view_xml_id = fields.Char(string="View XML ID", required=True)

    view_id = fields.Many2one(comodel_name="ir.ui.view", compute="_compute_view_id")

    tab_name = fields.Char(required=True)

    tab_description = fields.Char(required=True)

    merge_tab_names = fields.Char(required=True)

    @api.constrains("view_xml_id")
    def check_view_xml_id(self):
        if len(re.findall(r"^\w+\.\w+$", self.view_xml_id)) != 1:
            raise ValidationError(_("'%s' : Incorrect XML ID.") % self.view_xml_id)

    @api.constrains("tab_name")
    def check_tab_name(self):
        if len(re.findall(r"(\w+)", self.tab_name)) != 1:
            raise ValidationError(_("'%s' : Incorrect Tab Name.") % self.tab_name)

    @api.constrains("merge_tab_names")
    def check_merge_tab_names(self):
        for tab_name in self.merge_tab_names.split(","):
            if len(re.findall(r"(\w+)", tab_name)) != 1:
                raise ValidationError(_("'%s' : Incorrect Tab Name.") % tab_name)

    @api.depends("view_xml_id")
    def _compute_view_id(self):
        for setting in self:
            if setting.view_xml_id:
                item = self.env.ref(setting.view_xml_id, raise_if_not_found=False)
                if item and item._name == "ir.ui.view":
                    setting.view_id = item
                else:
                    setting.view_id = False
            else:
                setting.view_id = False

    @api.model_create_multi
    def create(self, vals_list):
        res = super().create(vals_list)
        self.clear_caches()
        return res

    def write(self, vals):
        res = super().write(vals)
        self.clear_caches()
        return res

    def unlink(self):
        res = super().unlink()
        self.clear_caches()
        return res
