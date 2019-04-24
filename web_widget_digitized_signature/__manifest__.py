# Copyright 2004-2010 OpenERP SA (<http://www.openerp.com>)
# Copyright 2011-2015 Serpent Consulting Services Pvt. Ltd.
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Widget Digitized Signature",
    "version": "11.0.1.0.0",
    "author": "Serpent Consulting Services Pvt. Ltd., "
              "Agile Business Group, "
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/web',
    "license": "AGPL-3",
    "category": 'Web',
    'depends': [
        'web',
        'mail',
    ],
    'data': [
        'views/web_digital_sign_view.xml',
        'views/res_users_view.xml',
    ],
    'qweb': [
        'static/src/xml/digital_sign.xml',
    ],
    'installable': True,
}
