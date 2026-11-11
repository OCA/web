# Copyright 2022 ForgeFlow S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


import logging

from lxml import html

from odoo import api, models

_logger = logging.getLogger(__name__)

try:
    import mpld3
except (OSError, ImportError) as err:  # pragma: no cover
    _logger.debug(err)


class AbstractMpld3Parser(models.AbstractModel):
    _name = "abstract.mpld3.parser"
    _description = "Utility to parse ploot figure to json data for widget Mpld3"

    @api.model
    def convert_figure_to_json(self, figure):  # pragma: no cover
        html_string = mpld3.fig_to_html(figure, no_extras=True, include_libraries=False)
        root = html.fragment_fromstring(html_string, create_parent="div")
        json_data = {
            "div": html.tostring(
                root.find(".//div"), encoding="unicode", with_tail=False
            ),
            "script": root.find(".//script").text or "",
        }
        return json_data
