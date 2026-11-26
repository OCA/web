# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Web Timeline Gantt UX",
    "summary": "Enterprise-style Gantt layout, theme and interactive dependency"
    " editing for web_timeline views (opt-in per view via gantt_ux)",
    "version": "19.0.1.0.0",
    "development_status": "Beta",
    "category": "web",
    "author": "Cubert GmbH, Odoo Community Association (OCA)",
    "maintainers": ["nghorbani"],
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web_timeline"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_timeline_gantt_ux/static/src/core/bezier.esm.js",
            "web_timeline_gantt_ux/static/src/core/arch_parser_patch.esm.js",
            "web_timeline_gantt_ux/static/src/gantt_layout/gantt_theme.scss",
            "web_timeline_gantt_ux/static/src/gantt_layout/model_patch.esm.js",
            "web_timeline_gantt_ux/static/src/gantt_layout/canvas_patch.esm.js",
            "web_timeline_gantt_ux/static/src/gantt_layout/canvas_defs.xml",
            "web_timeline_gantt_ux/static/src/gantt_layout/renderer_layout_patch.esm.js",
            "web_timeline_gantt_ux/static/src/gantt_layout/controller_layout_patch.esm.js",
            "web_timeline_gantt_ux/static/src/dependency_edit/dependency_edit.scss",
            "web_timeline_gantt_ux/static/src/dependency_edit/dependency_link_dragger.esm.js",
            "web_timeline_gantt_ux/static/src/dependency_edit/renderer_dep_patch.esm.js",
            "web_timeline_gantt_ux/static/src/dependency_edit/controller_dep_patch.esm.js",
            "web_timeline_gantt_ux/static/src/dependency_edit/move_cascade.esm.js",
            "web_timeline_gantt_ux/static/src/dependency_edit/move_cascade_dialog.xml",
            "web_timeline_gantt_ux/static/src/dependency_edit/move_cascade_patch.esm.js",
        ],
        "web.assets_unit_tests": [
            "web_timeline_gantt_ux/static/tests/**/*.test.js",
        ],
    },
}
