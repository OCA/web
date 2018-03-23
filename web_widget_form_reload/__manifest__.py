# -*- coding: utf-8 -*-
##############################################################################
##############################################################################
{
    'name': 'Widget Form Reload',
    'version': '10.0.0.0.0',
    "author": 'TKO',
    'category': 'web',
    'license': 'AGPL-3',

    'website': 'http://tko.tko-br.com',
    'description': """
     Reload form without reloading whole tab
    """,
    'depends': [
                'base',
                'web'],
    'data': [
             'views/reload_form_view.xml',
            ],
    'demo_xml': [],
    'test': [],
    'qweb' : [
    ],
    'installable': True,
    'auto_install' : True,
}
