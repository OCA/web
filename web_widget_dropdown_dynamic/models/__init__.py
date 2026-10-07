from odoo.tools import config

if not config.get("without_demo"):
    from . import ir_filters
