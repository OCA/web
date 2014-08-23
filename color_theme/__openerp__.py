{
    'name' : 'Color Theme',
    'version' : '0.1',
    'category' : 'Tools',
    'author': 'K-Omran',
    'description': """
This module allows user to easily change OpenERP color theme.
=============================================================
This module allows user To define new color theme and save it for future use.\n
Each user can select any stored color theme as his theme and also can make his own theme.\n
special thanks to "Zesty Beanz Technologies" for their contributions.
""",

    'depends':['base', 'web'],
    'data':[
              'security/ir.model.access.csv',
              'views/color_theme_view.xml',
              ],
    'js':[
           'static/lib/colorpicker/js/colorpicker.js',
           'static/lib/colorpicker/js/eye.js',
           'static/lib/colorpicker/js/utils.js',
           'static/lib/colorpicker/js/layout.js?ver=1.0.2',
           'static/src/js/color_theme.js',
           ],

    'qweb':[],
    'css':[
            'static/lib/colorpicker/css/colorpicker.css',
            'static/lib/colorpicker/css/layout.css',
            ],

    'web_preload': False,
}
