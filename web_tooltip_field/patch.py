import logging

from odoo.fields import Field

_logger = logging.getLogger(__name__)

_former_field_description_help = Field._description_help


def _description_help(self, env):
    model_name = self.base_field.model_name
    help_tooltip = env["ir.model.fields.help.tooltip"].search(
        [
            ("field_id.name", "=", self.name),
            ("model", "=", model_name),
            ("help", "!=", ""),
        ],
        limit=1,
    )
    if help_tooltip:
        return help_tooltip.help
    return _former_field_description_help(self, env)


def post_load():
    _logger.info("Aplying patch web_tooltip_field ...")
    Field._description_help = _description_help
