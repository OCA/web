# Copyright 2024 ForgeFlow S.L. (https://www.forgeflow.com)
# Part of ForgeFlow. See LICENSE file for full copyright and licensing details.

import json

from odoo import http
from odoo.http import request


class CustomFuzzySearchController(http.Controller):
    @http.route("/command_search/data", type="http", auth="user", methods=["GET"])
    def get_command_search_data(self):
        searches = request.env["command.search"].sudo().search([])
        result = []
        for search in searches:
            if any(
                group_id in search.env.user.groups_id for group_id in search.group_ids
            ):
                result.append(
                    {
                        "id": search.id,
                        "name": search.name,
                        "technical_name": search.technical_name,
                        "character": search.character,
                        "placeholder": search.placeholder,
                        "empty_message": search.empty_message,
                    }
                )
        return request.make_response(
            json.dumps(result), headers={"Content-Type": "application/json"}
        )
