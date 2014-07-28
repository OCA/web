{
    'name' : 'Color Theme',
    'version' : '0.1',
    'sequence' : 1,
    'category' : 'Tools',
    'author': 'K-Omran ISFP Egypt',
    'description': """
This Module Allows User To Easily Change OpenERP Color Theme.
=============================================================
This Module Allows User To Define New Color Theme And Save It For Future Use.
Each User Can Select Any Stored Color Theme As His Theme And Also Can Make His Own Theme.
Special Thanks To "Zesty Beanz Technologies" For Their Contributions.
""",

    'depends' : ['base', 'web'],
    'data' : [
              'security/ir.model.access.csv',
              'views/color_theme_view.xml',
              ],
    'js': [
           'static/src/colorpicker/js/colorpicker.js',
           'static/src/colorpicker/js/eye.js',
           'static/src/colorpicker/js/utils.js',
           'static/src/colorpicker/js/layout.js?ver=1.0.2',
           'static/src/js/color_theme.js',
           ],
           
    'qweb': [],
    'css': [
            'static/src/colorpicker/css/colorpicker.css',
            'static/src/colorpicker/css/layout.css',
            ],
    
    'web_preload': False,
    
}
