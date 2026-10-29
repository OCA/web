from odoo import fields


class PortalPropertiesDefinition(fields.PropertiesDefinition):
    ALLOWED_KEYS = fields.PropertiesDefinition.ALLOWED_KEYS + ("view_in_portal",)
