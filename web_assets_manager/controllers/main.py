# © 2024 initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from werkzeug.exceptions import NotFound

from odoo import http
from odoo.http import content_disposition, request


class Controller(http.Controller):
    @http.route("/web/binary/assets/<int:asset_id>", type="http", auth="user")
    def _download_web_assets(self, asset_id):
        assets = request.env["web.assets"].search([("id", "=", asset_id)])
        if not assets:
            raise NotFound()

        return request.make_response(
            assets.generate_filelist(),
            headers=[
                ("Content-Type", "text/plain"),
                ("Content-Disposition", content_disposition(f"{assets.name}.txt")),
            ],
        )
