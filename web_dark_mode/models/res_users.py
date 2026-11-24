# © 2022 Florian Kantelberg - initOS GmbH
# Copyright 2026 Altixia (https://www.altixia.com)
# @author: Claude Perrin <claude@altixia.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import api, fields, models

APPEARANCES = [("auto", "Default"), ("light", "Light"), ("dark", "Dark")]


def reload_page(action):
    """The theme is read when the page loads (cookie and style sheets): the
    Preferences reload the page, not only the context, so that a new appearance
    applies at once. Any other action goes through unchanged."""
    if isinstance(action, dict) and action.get("tag") == "reload_context":
        return {"type": "ir.actions.client", "tag": "reload"}
    return action


class ResUsers(models.Model):
    _inherit = "res.users"

    dark_mode = fields.Boolean()
    dark_mode_device_dependent = fields.Boolean("Device Dependent Dark Mode")
    # One choice in the Preferences instead of the "Device Dependent Dark Mode"
    # box: a view of the two settings above, written back on change.
    color_scheme_mode = fields.Selection(
        APPEARANCES,
        string="Appearance",
        compute="_compute_color_scheme_mode",
        inverse="_inverse_color_scheme_mode",
        help="Default: follows the device (light or dark, as it is set, evening "
        "included).",
    )

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + [
            "dark_mode_device_dependent",
            "dark_mode",
            "color_scheme_mode",
        ]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + [
            "dark_mode_device_dependent",
            "dark_mode",
            "color_scheme_mode",
        ]

    @api.depends("dark_mode", "dark_mode_device_dependent")
    def _compute_color_scheme_mode(self):
        for user in self:
            if user.dark_mode_device_dependent:
                user.color_scheme_mode = "auto"
            else:
                user.color_scheme_mode = "dark" if user.dark_mode else "light"

    def _inverse_color_scheme_mode(self):
        for user in self:
            if user.color_scheme_mode == "auto":
                user.dark_mode_device_dependent = True
            elif user.color_scheme_mode in ("light", "dark"):
                user.write(
                    {
                        "dark_mode_device_dependent": False,
                        "dark_mode": user.color_scheme_mode == "dark",
                    }
                )

    def preference_save(self):
        return reload_page(super().preference_save())
