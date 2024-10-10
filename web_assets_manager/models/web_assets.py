# © 2024 initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import hashlib

from odoo import _, api, fields, models


class WebAssets(models.Model):
    _name = "web.assets"
    _description = "Web Assets"

    name = fields.Char(required=True)
    active = fields.Boolean(default=True)
    bundle = fields.Char(
        required=True,
        help="Name of the bundle to control. E.g. `web.assets_common_minimal`",
    )
    path_regex = fields.Char(
        required=True,
        help="Python regex to match the route this web asset is applicable to. It "
        "always matches the beginning of the route",
    )
    hashsum = fields.Char(compute="_compute_hashsum", store=True)
    file_ids = fields.One2many("web.assets.file", "asset_id")
    file_included = fields.Integer(compute="_compute_included")
    file_total = fields.Integer(compute="_compute_included")

    @api.depends("file_ids", "file_ids.include")
    def _compute_included(self):
        for rec in self:
            total = rec.file_ids
            included = total.filtered("include")
            rec.write(
                {
                    "file_included": len(included),
                    "file_total": len(rec.file_ids),
                }
            )

    @api.depends("file_ids", "file_ids.include")
    def _compute_hashsum(self):
        for rec in self:
            filelist = rec.generate_filelist()
            rec.hashsum = hashlib.sha256(filelist.encode()).hexdigest()[:10]

    def generate_filelist(self):
        self.ensure_one()
        files = self.mapped("file_ids").filtered("include").mapped("name")
        return "\n".join(sorted(set(files)))

    def action_open_files(self):
        view = self.env.ref("web_assets_manager.view_web_assets_file_tree")
        return {
            "name": _("Assets Files"),
            "type": "ir.actions.act_window",
            "view_mode": "tree",
            "views": [[view.id, "tree"]],
            "res_model": "web.assets.file",
            "domain": [("asset_id", "in", self.ids)],
            "target": "current",
        }

    def action_download(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_url",
            "target": "new",
            "url": f"/web/binary/assets/{self.id}",
        }

    def action_upload(self):
        self.ensure_one()
        return {
            "name": _("Assets Upload"),
            "type": "ir.actions.act_window",
            "view_mode": "form",
            "res_model": "web.assets.wizard",
            "target": "new",
            "context": {
                "default_action": "upload",
                "default_asset_id": self.id,
            },
        }
