# -*- coding: utf-8 -*-
# © initOS GmbH 2014
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Web Custom Filter Tabs',
    'version': '7.0.1.0.0',
    'category': 'Tools',
    'description': """
Enable tab feature in the web client.
===========================================

Add a tab after topbar in order to access custom filter (if any).

    """,
    'author': 'initOS GmbH, Odoo Community Association (OCA)',
    'website': 'http://www.initos.com',
    'license': 'AGPL-3',
    'depends': ['search_filter_action_specific'],
    'data': [],
    'js': ['static/src/js/web_filter_tabs.js'],
    'css': ['static/src/css/web_filter_tabs.css'],
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
    'auto_install': False,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
