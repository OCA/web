{
    'name': 'Many2many and Many2one Delete All Button',
    'summary': 'Adds a button to',
    'version': '10.0.1.0.0',
    'category': 'Web',
    'author': 'Onestein,Odoo Community Association (OCA)',
    'website': 'http://www.onestein.nl',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'templates/assets.xml'
    ],
    'qweb': [
        'static/src/xml/web_x2many_delete_all.xml'
    ],
    'installable': True,
    'application': False,
}
