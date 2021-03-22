import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo13-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo13-addon-web_action_conditionable',
        'odoo13-addon-web_advanced_search',
        'odoo13-addon-web_company_color',
        'odoo13-addon-web_decimal_numpad_dot',
        'odoo13-addon-web_dialog_size',
        'odoo13-addon-web_disable_export_group',
        'odoo13-addon-web_domain_field',
        'odoo13-addon-web_drop_target',
        'odoo13-addon-web_editor_background_color',
        'odoo13-addon-web_environment_ribbon',
        'odoo13-addon-web_group_expand',
        'odoo13-addon-web_ir_actions_act_multi',
        'odoo13-addon-web_ir_actions_act_view_reload',
        'odoo13-addon-web_ir_actions_act_window_message',
        'odoo13-addon-web_listview_range_select',
        'odoo13-addon-web_m2x_options',
        'odoo13-addon-web_no_bubble',
        'odoo13-addon-web_notify',
        'odoo13-addon-web_pivot_computed_measure',
        'odoo13-addon-web_pwa_oca',
        'odoo13-addon-web_responsive',
        'odoo13-addon-web_search_with_and',
        'odoo13-addon-web_sheet_full_width',
        'odoo13-addon-web_timeline',
        'odoo13-addon-web_tree_dynamic_colored_field',
        'odoo13-addon-web_tree_image_tooltip',
        'odoo13-addon-web_tree_many2one_clickable',
        'odoo13-addon-web_widget_bokeh_chart',
        'odoo13-addon-web_widget_domain_editor_dialog',
        'odoo13-addon-web_widget_dropdown_dynamic',
        'odoo13-addon-web_widget_dropdown_dynamic_example',
        'odoo13-addon-web_widget_image_download',
        'odoo13-addon-web_widget_many2one_simple',
        'odoo13-addon-web_widget_mpld3_chart',
        'odoo13-addon-web_widget_numeric_step',
        'odoo13-addon-web_widget_url_advanced',
        'odoo13-addon-web_widget_x2many_2d_matrix',
        'odoo13-addon-web_widget_x2many_2d_matrix_example',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
