from openerp.osv import orm, fields


# ============================Color Theme Model==============================


class color_theme(orm.Model):
    """This Model To Store Color Themes To be Selectd Later"""

    _name = 'color.theme'

    _rec_name = 'theme_name'

    _columns = {'theme_name': fields.char('Theme Name', size=128, required=True, ),

                'top_bar_gradient_1': fields.char('Top Bar Gradient First Color', size=6, ),

                'top_bar_gradient_2': fields.char('Top Bar Gradient Second Color', size=6, ),

                'button_gradient_1': fields.char('Button Background Gradient First Color', size=6, ),

                'button_gradient_2': fields.char('Button Background Gradient Second Color', size=6, ),

                'left_bar': fields.char('Left Bar Color', size=6, ),

                'body_font': fields.char('Body Font Color', size=6, ),

                'main_menu_font': fields.char('Main Menu Font Color', size=6, ),

                'sub_menu_font': fields.char('Sub Menu Font Color', size=6, ),

                'top_bar_menu_font': fields.char('Top Bar Menu Font Color', size=6, ),

                'tab_string': fields.char('Tab String Font Color', size=6, ),

                'many2one_font': fields.char('Link Color', size=6, ),
                }

    _sql_constraints = [('unique_theme_name', 'unique(theme_name)', 'Theme With The Same Name Already Exists'), ]

# ==============================================================================================
