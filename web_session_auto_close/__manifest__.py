# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Session Auto Close",
    "summary": """
        This module purpose is to automatically close the session when the last odoo
        tab is closed or when the computer gets in idle mode.
        The `timeout` occurs 15 seconds after the tab has been closed or the computer
        got idle.""",
    "version": "13.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["bus", "web"],
    "data": ["views/assets_common.xml", "views/assets_backend.xml"],
}
