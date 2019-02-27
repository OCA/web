import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo11-addons-oca-web",
    description="Meta package for oca-web Odoo addons",
    version=version,
    install_requires=[
        'odoo11-addon-web_action_conditionable',
        'odoo11-addon-web_advanced_search',
        'odoo11-addon-web_decimal_numpad_dot',
        'odoo11-addon-web_dialog_size',
        'odoo11-addon-web_disable_export_group',
        'odoo11-addon-web_editor_background_color',
        'odoo11-addon-web_environment_ribbon',
        'odoo11-addon-web_export_view',
        'odoo11-addon-web_favicon',
        'odoo11-addon-web_group_expand',
        'odoo11-addon-web_ir_actions_act_multi',
        'odoo11-addon-web_ir_actions_act_view_reload',
        'odoo11-addon-web_listview_range_select',
        'odoo11-addon-web_m2x_options',
        'odoo11-addon-web_no_bubble',
        'odoo11-addon-web_notify',
        'odoo11-addon-web_responsive',
        'odoo11-addon-web_search_with_and',
        'odoo11-addon-web_searchbar_full_width',
        'odoo11-addon-web_send_message_popup',
        'odoo11-addon-web_sheet_full_width',
        'odoo11-addon-web_timeline',
        'odoo11-addon-web_tree_dynamic_colored_field',
        'odoo11-addon-web_tree_image',
        'odoo11-addon-web_tree_many2one_clickable',
        'odoo11-addon-web_tree_resize_column',
        'odoo11-addon-web_widget_bokeh_chart',
        'odoo11-addon-web_widget_color',
        'odoo11-addon-web_widget_datepicker_options',
        'odoo11-addon-web_widget_domain_editor_dialog',
        'odoo11-addon-web_widget_image_download',
        'odoo11-addon-web_widget_image_url',
        'odoo11-addon-web_widget_many2many_tags_multi_selection',
        'odoo11-addon-web_widget_url_advanced',
        'odoo11-addon-web_widget_x2many_2d_matrix',
        'odoo11-addon-web_widget_x2many_2d_matrix_example',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
