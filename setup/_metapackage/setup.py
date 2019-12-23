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
        'odoo13-addon-web_environment_ribbon',
        'odoo13-addon-web_responsive',
        'odoo13-addon-web_tree_many2one_clickable',
        'odoo13-addon-web_widget_bokeh_chart',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
