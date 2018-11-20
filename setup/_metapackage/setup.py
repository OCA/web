import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo12-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo12-addon-web_decimal_numpad_dot',
        'odoo12-addon-web_disable_export_group',
        'odoo12-addon-web_environment_ribbon',
        'odoo12-addon-web_favicon',
        'odoo12-addon-web_listview_range_select',
        'odoo12-addon-web_notify',
        'odoo12-addon-web_timeline',
        'odoo12-addon-web_widget_x2many_2d_matrix',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
