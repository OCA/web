# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Form",
    "summary": """
        This addon add web forms""",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "category": "web",
    "website": "https://github.com/OCA/web",
    "depends": [
        # Odoo Community
        "mail",
        "web",
    ],
    "data": [
        "security/groups.xml",
        "security/web_form_default.xml",
        "security/web_form_input.xml",
        "security/web_form.xml",
        "views/web_form.xml",
        "views/templates.xml",
    ],
    "maintainers": ["sbejaoui"],
    "external_dependencies": {"python": ["python-dateutil"]},
    "installable": True,
}
