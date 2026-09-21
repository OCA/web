# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import re

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class IrUiViewMergeNotebookTab(models.Model):
    _name = "ir.ui.view.merge.notebook.tab"
    _description = "Merge Notebook Tab Settings"

    model_id = fields.Many2one(
        comodel_name="ir.model", required=True, ondelete="cascade"
    )

    model = fields.Char(string="Model Name", related="model_id.model")

    view_id = fields.Many2one(
        comodel_name="ir.ui.view",
        domain='[("model", "=" , model), ("type", "=", "form")]',
        required=True,
    )

    view_xml_id = fields.Char(
        string="View XML ID", related="view_id.xml_id", store=True
    )

    tab_name = fields.Char(
        compute="_compute_tab_name",
        store=True,
        readonly=False,
        help="Technical field. 'name' field of the <page> element that will be inserted.",
    )

    tab_string = fields.Char(
        required=True,
        help="Text displayed in the header of the tab."
        " 'string' field of the <page> element that will be inserted.",
    )

    tab_name_position = fields.Char(
        help="Name of the tab after which the new tab will be inserted."
        " Let empty to position the tab first."
    )

    merge_tab_names = fields.Char(required=True)

    tab_names_available = fields.Char(compute="_compute_tab_names_available")

    @api.constrains("tab_name")
    def check_tab_name(self):
        if len(re.findall(r"(\w+)", self.tab_name)) != 1:
            raise ValidationError(_("'%s' : Incorrect Tab Name.") % self.tab_name)

    @api.constrains("merge_tab_names")
    def check_merge_tab_names(self):
        if len(re.findall(r"^((\w+),)+(\w+)$", self.merge_tab_names)) != 1:
            raise ValidationError(
                _(
                    "'%(tab_names)s' : Incorrect Tab Names to merge.",
                    tab_names=self.merge_tab_names,
                )
            )
        for tab_name in self.merge_tab_names.split(","):
            if tab_name not in self.tab_names_available.split(","):
                raise ValidationError(
                    _("Tab Name '%(tab_name)s' is not available.", tab_name=tab_name)
                )

    @api.constrains("tab_name_position")
    def check_tab_name_position(self):
        if not self.tab_name_position:
            return
        if len(re.findall(r"^(\w+)$", self.tab_name_position)) != 1:
            raise ValidationError(
                _(
                    "'%(position)s' : Incorrect position.",
                    position=self.tab_name_position,
                )
            )
        if self.tab_name_position not in self.tab_names_available.split(","):
            raise ValidationError(
                _(
                    "Tab Name '%(position)s' is not available.",
                    position=self.tab_name_position,
                )
            )

    @api.depends("view_id")
    def _compute_tab_name(self):
        for setting in self.filtered(lambda x: x.view_id):
            setting.tab_name = (
                f"tab_{setting.view_xml_id.replace('.', '_')}_{setting.id}"
            )
        for setting in self.filtered(lambda x: not x.view_id):
            setting.tab_name = False

    @api.depends("view_id")
    def _compute_tab_names_available(self):
        for setting in self.filtered(lambda x: x.view_id):
            setting.tab_names_available = ""
            arch, _view = (
                self.env["base"]
                .with_context(merge_notebook_tabs=False)
                ._get_view(view_id=setting.view_id.id)
            )
            tab_list = [x.get("name", "NAME_UNDEFINED") for x in arch.xpath("//page")]
            setting.tab_names_available = ",".join(tab_list)
        for setting in self.filtered(lambda x: not x.view_id):
            setting.tab_names_available = ""

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
