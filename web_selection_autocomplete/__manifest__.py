# Copyright 2019 LevelPrime srl
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': "Web Selection Autocomplete",
    'summary': """
        Add the widget 'selection_autocomplete' which make selection field ui
        more similar to the many2one's, allowing to filter the selection values.

        The most advantageous case is when:
            - there are a lot of selection values
            - new model not needed but still want the many2one field ui
    """,
    'author': "LevelPrime srl, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/web",
    'license': 'AGPL-3',
    'development_status': 'Beta',
    'category': 'Web',
    'version': '12.0.1.0.0',
    'depends': ['base', 'web'],
    'data': [
        'static/src/xml/assets.xml',
    ],
    'qweb': [
        'static/src/xml/template.xml'
    ],
    'application': False,
    'installable': True
}
