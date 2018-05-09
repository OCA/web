import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo11-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo11-addon-web_action_conditionable',
        'odoo11-addon-web_decimal_numpad_dot',
        'odoo11-addon-web_dialog_size',
        'odoo11-addon-web_environment_ribbon',
        'odoo11-addon-web_favicon',
        'odoo11-addon-web_listview_range_select',
        'odoo11-addon-web_no_bubble',
        'odoo11-addon-web_notify',
        'odoo11-addon-web_responsive',
        'odoo11-addon-web_searchbar_full_width',
        'odoo11-addon-web_sheet_full_width',
        'odoo11-addon-web_timeline',
        'odoo11-addon-web_tree_dynamic_colored_field',
        'odoo11-addon-web_tree_many2one_clickable',
        'odoo11-addon-web_widget_bokeh_chart',
        'odoo11-addon-web_widget_color',
        'odoo11-addon-web_widget_many2many_tags_multi_selection',
        'odoo11-addon-web_widget_x2many_2d_matrix',
        'odoo11-addon-web_widget_x2many_2d_matrix_example',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
