{
'name': 'Web Community Theme',
'author': 'Rossa S.A.',
'category': 'Hidden',
'version': '8.0.1.0',
'description':
"""
Community web customizations theme
========================
This modules aims to be an unified community customization for the standard web module

Currently the modules changes the web interface colors and brand and replaces the drill-down symbol by a plus symbol
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
'installable': False,
'auto_install': True,
}
