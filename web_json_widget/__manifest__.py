# Copyright 2025 Lambdao
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web JSON Widget",
    "version": "18.0.1.0.0",
    "category": "Technical",
    "summary": """
Provides a user-friendly widget to display and edit JSON fields.
The widget is an interactive, structured editor.

Features:
- Syntax highlighting for JSON data.
- Collapsible nodes for better readability of complex JSON objects.
- Direct editing capabilities within the form view.
- Real-time validation to prevent syntax errors.
    """,
    "author": "Lambdao, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "/web_json_widget/static/src/components/json_editor/json_editor.esm.js",
            "/web_json_widget/static/src/components/json_editor/json_editor.xml",
            "/web_json_widget/static/src/components/json_editor/json_editor.css",
            # content from https://app.unpkg.com/jsoneditor@10.2.0/files/dist
            # source: https://github.com/josdejong/jsoneditor?tab=readme-ov-file
            # licenced under Apache-2.0 license
            "/web_json_widget/static/src/lib/dark-theme.css",
            "/web_json_widget/static/src/lib/vanilla-jsoneditor.min.js",
            "/web_json_widget/static/src/lib/vanilla-jsoneditor.min.css",
            # be careful not to change the hierarchy to make sure icons are loaded!
            "/web_json_widget/static/src/lib/img/jsoneditor-icons.svg",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
