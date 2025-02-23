import base64
import datetime
import logging
import re

import requests

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class IconifyProxyController(http.Controller):
    """Controller for proxying Iconify requests."""

    def _fetch_iconify_data(
        self, upstream_url, content_type, prefix, icons=None, icon=None
    ):
        """Fetches data from the Iconify API or the local cache.

        Args:
            upstream_url (str): The URL of the Iconify API endpoint.
            content_type (str): The expected content type of the response.
            prefix (str): The icon prefix.
            icons (str, optional): Comma-separated list of icons (for CSS and JSON).
            icon (str, optional): The icon name (for SVG).

        Returns:
            Response: The HTTP response.
        """

        # Validate prefix
        if not re.match(r"^[a-z0-9-]+$", prefix):
            return request.not_found()

        # Validate icon (if provided)
        if icon and not re.match(r"^[a-z0-9:-]+$", icon):
            return request.not_found()

        # Validate icons (if provided)
        if icons:
            icon_list = icons.split(",")
            for single_icon in icon_list:
                if not re.match(r"^[a-z0-9:-]+$", single_icon):
                    return request.not_found()
            icons = ",".join(icon_list)  # Reconstruct to prevent injection

        Attachment = request.env["ir.attachment"].sudo()
        if content_type == "image/svg+xml":
            name = f"{prefix}-{icon}"
            res_model = "iconify.svg"
        elif content_type == "text/css":
            name = f"{prefix}-{icons}"
            res_model = "iconify.css"
        elif content_type == "application/json":
            name = f"{prefix}-{icons}"
            res_model = "iconify.json"
        else:
            return request.not_found()

        attachment = Attachment.search(
            [("res_model", "=", res_model), ("name", "=", name)], limit=1
        )

        if attachment:
            _logger.info(f"Serving from cache: {name}")
            data = base64.b64decode(attachment.datas)
            headers = [
                ("Content-Type", content_type),
                ("Cache-Control", "public, max-age=31536000"),
                ("X-Cached-At", str(attachment.create_date)),
            ]
            return request.make_response(data, headers)

        _logger.info(f"Fetching from API: {upstream_url}")
        try:
            response = requests.get(upstream_url, timeout=5)
            response.raise_for_status()  # Raise HTTPError for bad responses
        except requests.exceptions.RequestException as e:
            _logger.error(f"Request to Iconify API failed: {e}")
            return request.not_found()

        data = response.content
        attachment = Attachment.create(
            {
                "name": name,
                "datas": base64.b64encode(data).decode("utf-8"),
                "res_model": res_model,
                "res_id": 0,
                "type": "binary",
            }
        )

        headers = [
            ("Content-Type", content_type),
            ("Cache-Control", "public, max-age=31536000"),  # Cache for one year
        ]
        return request.make_response(data, headers)

    @http.route(
        "/web_iconify_proxy/<string:prefix>/<string:icon>.svg",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_svg(self, prefix, icon, **params):
        """Gets an SVG icon from the Iconify API.

        Args:
            prefix (str): The icon prefix.
            icon (str): The icon name.

        Returns:
            Response: The HTTP response containing the SVG data.
        """
        upstream_url = f"https://api.iconify.design/{prefix}/{icon}.svg"
        return self._fetch_iconify_data(
            upstream_url, "image/svg+xml", prefix, icon=icon
        )

    @http.route(
        "/web_iconify_proxy/<string:prefix>.css",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_css(self, prefix, **params):
        """Gets CSS for a set of icons from the Iconify API.

        Args:
            prefix (str): The icon prefix.
            params (dict): Query parameters, including 'icons'.

        Returns:
            Response: The HTTP response containing the CSS data.
        """
        icons = params.get("icons")
        if not icons:
            return request.not_found()
        upstream_url = f"https://api.iconify.design/{prefix}.css?icons={icons}"
        return self._fetch_iconify_data(upstream_url, "text/css", prefix, icons=icons)

    @http.route(
        "/web_iconify_proxy/<string:prefix>.json",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_json(self, prefix, **params):
        """Gets JSON data for a set of icons from the Iconify API.

        Args:
            prefix (str): The icon prefix.
            params (dict): Query parameters, including 'icons'.

        Returns:
            Response: The HTTP response containing the JSON data.
        """
        icons = params.get("icons")
        if not icons:
            return request.not_found()
        upstream_url = f"https://api.iconify.design/{prefix}.json?icons={icons}"
        return self._fetch_iconify_data(
            upstream_url, "application/json", prefix, icons=icons
        )

    @http.route(
        "/web_iconify_proxy/last-modified",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_last_modified(self, **params):
        """Gets the last modification timestamp for the cached data.

        Args:
            params (dict): Query parameters, including 'prefixes'.

        Returns:
            Response: The HTTP response containing the timestamp.
        """
        prefixes = params.get("prefixes")
        if not prefixes:
            return request.not_found()

        prefixes_list = prefixes.split(",")

        Attachment = request.env["ir.attachment"].sudo()

        # Search for attachments related to iconify
        attachments = Attachment.search(
            [
                ("res_model", "in", ["iconify.svg", "iconify.css", "iconify.json"]),
                # Check if name contains any of the prefixes
                ("name", "like", "|".join(prefixes_list)),
            ]
        )

        if not attachments:
            return request.not_found()

        # Find the latest create_date
        latest_timestamp = max(
            attachments.mapped("create_date"), default=datetime.datetime.min
        )

        headers = [("Content-Type", "application/json"), ("Cache-Control", "no-cache")]
        return request.make_response(str(latest_timestamp.timestamp()), headers)
