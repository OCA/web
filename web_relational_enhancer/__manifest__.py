# -*- coding: utf-8 -*-
{
    'name': "Web Relational Field Enhancer",
    'summary': """
        This module allow to display additional fields to
        the many2one widget dropdown and the many2many tags.
    """,
    'description': """
        Usage for O2m:

        ::

            <field name='<your field name>'
                   widget='many2many_tags'
                   options='{
                       "display_fields": "name,state,description"
                   }'/>


        Usage for M2o:

        ::

            <field name='<your field name>'
                   options='{
                       "display_fields": "name,state,description"
                   }'/>
    """,
    'author': "Michele Zaccheddu - LevelPrime Srl, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/web",
    'category': 'Web',
    'version': '10.0.1.0.0',
    'depends': ['base', 'web'],
    'data': ['static/src/xml/assets.xml']
}
