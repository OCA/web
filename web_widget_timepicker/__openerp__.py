# -*- coding: utf-8 -*-
# © 2016 Michael Fried @ Vividlab (<http://www.vividlab.de>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Timepicker Widget',
    'version': '9.0.1.0.0',
    'author': 'Michael Fried@Vividlab, Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'category': 'Web',
    'website': 'https://github.com/OCA/Web',

    # any module necessary for this one to work correctly
    'depends': [
        'web'
    ],
    'css': [
        'static/src/lib/jquery.timerpicker/jquery.timepicker.css',
		'static/src/css/web_widget_timepicker.css'
    ],
    'js': [
        'static/src/lib/jquery.timerpicker/jquery.timepicker.js',
        'static/src/js/web_widget_timepicker.js',
    ],
    'qweb' : [ 
        'static/src/xml/web_widget_timepicker.xml'
    ],

    # always loaded
    'data': [
        'views/web_widget_timepicker_assets.xml'
    ],

    #Installation options
    "installable": True,
}
