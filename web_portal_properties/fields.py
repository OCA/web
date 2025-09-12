from odoo import fields


class PortalPropertiesDefinition(fields.PropertiesDefinition):
    ALLOWED_KEYS = (
        "name",
        "string",
        "type",
        "comodel",
        "default",
        "selection",
        "tags",
        "domain",
        "view_in_cards",
        "view_in_portal",
    )
