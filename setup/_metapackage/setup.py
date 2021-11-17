import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo-addon-web_environment_ribbon>=15.0dev,<15.1dev',
        'odoo-addon-web_m2x_options>=15.0dev,<15.1dev',
        'odoo-addon-web_m2x_options_manager>=15.0dev,<15.1dev',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 15.0',
    ]
)
