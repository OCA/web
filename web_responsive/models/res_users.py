from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    show_apps_menu_on_load = fields.Selection(
        selection=[
            ("default", "Never (default)"),
            ("noaction", "When no action is specified"),
            ("always", "Always"),
        ],
        string="Show apps menu on load",
        help="""Determines whether to show the Apps Menu or the default app when Odoo
        is initially loaded.
        The default behaviour is to show the initial app.
        The option to show the Apps Menu when no action is specified usually works
        quite well, but could be problematic in some cases.
        The option to always show the Apps Menu is not recommended, but it is included
        for completeness.
        The page must be manually reloaded for this option to take effect.""",
        default="default",
    )
