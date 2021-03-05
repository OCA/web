import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo14-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo14-addon-web_dialog_size',
        'odoo14-addon-web_environment_ribbon',
        'odoo14-addon-web_m2x_options',
        'odoo14-addon-web_notify',
        'odoo14-addon-web_widget_x2many_2d_matrix',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
