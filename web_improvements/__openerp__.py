# -*- coding: utf-8 -*-
# © 2015 Marcelo Pickler & Rossa S.A.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
	'name': 'Web Improvements',
    "summary": "This modules aims to be a compilation of community improvements for the standard web module",
    "version": "8.0.1.0.0",
	'category': 'web',
    "website": "http://www.rossa.com.py",
    'author': 'Rossa S.A., Odoo Community Association (OCA)',
    "license": "AGPL-3",
    "application": False,
	'installable': True,
	'auto_install': False,
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
	'depends': [
		'web',
	],
	'data' : [
		'theme.xml',
		'views/webclient_templates.xml'],
	'qweb' : [
		"static/src/xml/*.xml",
	],
}
