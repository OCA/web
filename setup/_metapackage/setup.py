import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo-addon-web_advanced_search>=16.0dev,<16.1dev',
        'odoo-addon-web_chatter_position>=16.0dev,<16.1dev',
        'odoo-addon-web_company_color>=16.0dev,<16.1dev',
        'odoo-addon-web_dark_mode>=16.0dev,<16.1dev',
        'odoo-addon-web_dialog_size>=16.0dev,<16.1dev',
        'odoo-addon-web_domain_field>=16.0dev,<16.1dev',
        'odoo-addon-web_environment_ribbon>=16.0dev,<16.1dev',
        'odoo-addon-web_help>=16.0dev,<16.1dev',
        'odoo-addon-web_m2x_options>=16.0dev,<16.1dev',
        'odoo-addon-web_no_bubble>=16.0dev,<16.1dev',
        'odoo-addon-web_notify>=16.0dev,<16.1dev',
        'odoo-addon-web_refresher>=16.0dev,<16.1dev',
        'odoo-addon-web_responsive>=16.0dev,<16.1dev',
        'odoo-addon-web_search_with_and>=16.0dev,<16.1dev',
        'odoo-addon-web_select_all_companies>=16.0dev,<16.1dev',
        'odoo-addon-web_sheet_full_width>=16.0dev,<16.1dev',
        'odoo-addon-web_theme_classic>=16.0dev,<16.1dev',
        'odoo-addon-web_timeline>=16.0dev,<16.1dev',
        'odoo-addon-web_tree_many2one_clickable>=16.0dev,<16.1dev',
        'odoo-addon-web_widget_numeric_step>=16.0dev,<16.1dev',
        'odoo-addon-web_widget_plotly_chart>=16.0dev,<16.1dev',
        'odoo-addon-web_widget_x2many_2d_matrix>=16.0dev,<16.1dev',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 16.0',
    ]
)
