# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo import _, api, fields, models


class MailThread(models.AbstractModel):

    _inherit = "mail.thread"

    show_attachment_preview = fields.Boolean(
        compute="_compute_show_attachment_preview",
        help="Enable this option to display the attachment preview on forms.",
    )

    def _compute_show_attachment_preview(self):
        show_attachment_preview = self.env.user.show_attachment_preview
        for record in self:
            record.show_attachment_preview = show_attachment_preview

    def action_toggle_attachment_preview(self):
        self.env.user.show_attachment_preview = (
            not self.env.user.show_attachment_preview
        )
        self.invalidate_recordset(["show_attachment_preview"])

    @api.model
    def _get_view(self, view_id=None, view_type="form", **options):
        arch, view = super()._get_view(view_id=view_id, view_type=view_type, **options)
        if view_type == "form":
            self._add_attachment_preview_toggle_to_view(arch)
        return arch, view

    def _add_attachment_preview_toggle_to_view(self, arch):
        if not arch.xpath(
            "//div[contains(concat(' ', normalize-space(@class), ' '), "
            "' o_attachment_preview ')]"
        ):
            return
        headers = arch.xpath("//header")
        if not headers:
            return

        header = headers[0]
        if not arch.xpath("//field[@name='show_attachment_preview']"):
            header.insert(
                0,
                etree.Element(
                    "field",
                    name="show_attachment_preview",
                    invisible="1",
                ),
            )

        if header.xpath(".//button[@name='action_toggle_attachment_preview']"):
            return

        header.append(
            etree.Element(
                "button",
                name="action_toggle_attachment_preview",
                type="object",
                string=_("Show Attachment Preview"),
                attrs="{'invisible': [('show_attachment_preview', '=', True)]}",
            )
        )
        header.append(
            etree.Element(
                "button",
                name="action_toggle_attachment_preview",
                type="object",
                string=_("Hide Attachment Preview"),
                attrs="{'invisible': [('show_attachment_preview', '=', False)]}",
            )
        )
