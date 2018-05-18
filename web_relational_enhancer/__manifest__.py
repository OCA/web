# -*- coding: utf-8 -*-
{
    'name': "Web Relational Field Enhancer",
    'summary': """
        This module allow to add information to the 'display_name' on
        many2one dropdowns and many2many tags.
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
    'author': "Michele Zaccheddu - LevelPrime Srl",
    'website': "http://www.levelprime.it",
    'category': 'Web',
    'version': '1.0',
    'depends': ['base'],
    'data': ['static/src/xml/assets.xml']
}
