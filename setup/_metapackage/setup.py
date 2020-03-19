import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo13-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo13-addon-web_decimal_numpad_dot',
        'odoo13-addon-web_dialog_size',
        'odoo13-addon-web_domain_field',
        'odoo13-addon-web_environment_ribbon',
        'odoo13-addon-web_ir_actions_act_view_reload',
        'odoo13-addon-web_no_bubble',
        'odoo13-addon-web_notify',
        'odoo13-addon-web_responsive',
        'odoo13-addon-web_tree_dynamic_colored_field',
        'odoo13-addon-web_tree_many2one_clickable',
        'odoo13-addon-web_widget_bokeh_chart',
        'odoo13-addon-web_widget_image_download',
        'odoo13-addon-web_widget_mpld3_chart',
        'odoo13-addon-web_widget_url_advanced',
        'odoo13-addon-web_widget_x2many_2d_matrix',
        'odoo13-addon-web_widget_x2many_2d_matrix_example',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
