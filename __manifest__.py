# -*- coding: utf-8 -*-
# © 2015-2016 ONESTEiN BV (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'BI View Editor',
    'summary': '''Graphical BI views builder for Odoo 8''',
    'images': ['static/description/main_screenshot.png'],
    'author': 'ONESTEiN BV,Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'http://www.onestein.eu',
    'category': 'Reporting',
    'version': '9.0.1.0.0',
    'depends': [
        'base',
        'web'
    ],
    'data': [
        'security/ir.model.access.csv',
        'security/rules.xml',
        'templates/assets_template.xml',
        'views/bve_view.xml',
    ],
    'qweb': [
        'templates/qweb_template.xml',
    ],
    'js': [
        'static/src/js/bve.js'
    ],
}
