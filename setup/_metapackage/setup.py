import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo-addon-web_action_conditionable>=15.0dev,<15.1dev',
        'odoo-addon-web_advanced_search>=15.0dev,<15.1dev',
        'odoo-addon-web_company_color>=15.0dev,<15.1dev',
        'odoo-addon-web_domain_field>=15.0dev,<15.1dev',
        'odoo-addon-web_drop_target>=15.0dev,<15.1dev',
        'odoo-addon-web_environment_ribbon>=15.0dev,<15.1dev',
        'odoo-addon-web_group_expand>=15.0dev,<15.1dev',
        'odoo-addon-web_ir_actions_act_multi>=15.0dev,<15.1dev',
        'odoo-addon-web_listview_range_select>=15.0dev,<15.1dev',
        'odoo-addon-web_m2x_options>=15.0dev,<15.1dev',
        'odoo-addon-web_m2x_options_manager>=15.0dev,<15.1dev',
        'odoo-addon-web_no_bubble>=15.0dev,<15.1dev',
        'odoo-addon-web_refresher>=15.0dev,<15.1dev',
        'odoo-addon-web_responsive>=15.0dev,<15.1dev',
        'odoo-addon-web_search_with_and>=15.0dev,<15.1dev',
        'odoo-addon-web_sheet_full_width>=15.0dev,<15.1dev',
        'odoo-addon-web_view_calendar_list>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_bokeh_chart>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_child_selector>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_domain_editor_dialog>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_dropdown_dynamic>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_image_download>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_json_graph>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_numeric_step>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_open_tab>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_url_advanced>=15.0dev,<15.1dev',
        'odoo-addon-web_widget_x2many_2d_matrix>=15.0dev,<15.1dev',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 15.0',
    ]
)
