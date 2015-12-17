{
'name': 'Odoo.Social Theme',
'author': 'Rossa S.A.',
'category': 'Hidden',
'version': '8.0.1.0',
'description':
"""
Odoo.Social web theme
========================
This modules changes the web interface colors and and brand
""",
'depends': [
	'web',
],
'data' : [
	'theme.xml',
	'views/webclient_templates.xml'],
'qweb' : [
    "static/src/xml/*.xml",
],
'test': [],
'installable': True,
'auto_install': True,
}
