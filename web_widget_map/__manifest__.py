# Copyright 2019 Eficent Business and IT Consulting Services S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Widget Map',
    'summary': """
        Map widget using OpenLayers library""",
    'version': '12.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'Eficent Business and IT Consulting Services S.L.,'
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'depends': [
        'web',
    ],
    'data': [
        'views/assets.xml',
    ],
    'qweb': [
        'static/src/xml/web_map.xml',
    ],
}
