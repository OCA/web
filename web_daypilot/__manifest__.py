# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

{
    "name": "Web DayPilot",
    "category": "Hidden",
    "version": "19.0.1.0.9",
    "depends": ["web", "resource"],
    "data": [
        "views/resource_demo_views.xml",
    ],
    "demo": [
        "demo/resource_leaves_demo.xml",
    ],
    "assets": {
        "web._assets_primary_variables": [
            "web_daypilot/static/src/daypilot_view.variables.scss",
        ],
        "web.assets_backend_lazy": [
            "web_daypilot/static/src/xml/daypilot_controller.xml",
            "web_daypilot/static/src/daypilot_renderer.xml",
            "web_daypilot/static/src/daypilot_renderer_controls.xml",
            "web_daypilot/static/src/daypilot_arch_parser.esm.js",
            "web_daypilot/static/src/daypilot_controller.esm.js",
            "web_daypilot/static/src/daypilot_model.esm.js",
            "web_daypilot/static/src/daypilot_renderer.esm.js",
            "web_daypilot/static/src/daypilot_renderer_controls.esm.js",
            "web_daypilot/static/src/daypilot_view.esm.js",
            "web_daypilot/static/src/daypilot_view.scss",
        ],
        "web.assets_backend_lazy_dark": [
            "web_daypilot/static/src/daypilot_view.variables.dark.scss",
        ],
        "web.assets_unit_tests": [
            "web_daypilot/static/tests/**/*",
        ],
        "web.dark_mode_variables": [
            (
                "before",
                "web_enterprise/static/src/**/*.variables.scss",
                "web_daypilot/static/src/daypilot_view.variables.dark.scss",
            ),
        ],
    },
    "auto_install": False,
    "application": False,
    "installable": True,
    "author": "Open Source Integrators, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
}
