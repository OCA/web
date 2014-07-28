from openerp.osv import osv, fields
 
 #============================Color Theme Model==============================

class color_theme(osv.osv):
    """This Model To Store Color Themes To be Selectd Later And Applied To System Users"""
    
    _name = 'color.theme'
    
    _rec_name = 'theme_name'
    
    _columns = {
                
                'theme_name' : fields.char(
                            'Theme Name',
                            size=128,
                            required=True,
                            ),
                
                'top_bar_gradient_1' : fields.char(
                            'Top Bar Gradient First Color',
                            size=6,
                            ),
                
                'top_bar_gradient_2' : fields.char(
                            'Top Bar Gradient Second Color',
                            size=6,
                            ),
                                
                'button_gradient_1': fields.char(
                            'Button Background Gradient First Color',
                            size=6,
                            ),
                'button_gradient_2': fields.char(
                            'Button Background Gradient Second Color',
                            size=6,
                            ),
                
                'left_bar': fields.char(
                            'Left Bar Color',
                            size=6,
                            ),
                
                'body_font': fields.char(
                            'Body Font Color',
                            size=6,
                            ),
                
                'main_menu_font': fields.char(
                            'Main Menu Font Color',
                            size=6,
                            ),
                
                'sub_menu_font': fields.char(
                            'Sub Menu Font Color',
                            size=6,
                            ),
                
                'top_bar_menu_font': fields.char(
                            'Top Bar Menu Font Color',
                            size=6,
                            ),
                
                'tab_string': fields.char(
                            'Tab String Font Color',
                            size=6,
                            ),
                
                'many2one_font': fields.char(
                            'Link Color',
                            size=6,
                            ),
                
                }
    
    _sql_constraints = [('unique_theme_name', 'unique(theme_name)', 'Theme With The Same Name Already Exists'),]
    
         
color_theme()
#==============================================================================================


#===============================User Theme Model===============================================
class user_theme(osv.osv):
    """This Model To Assign Previously Stored Color Theme To User"""
    
    _name = 'user.theme'
    
    _rec_name = 'user'
    
    _columns = {
                
                'user' : fields.many2one(
                            'res.users',
                            'User Name',
                            required=True,
                            ondelete='cascade',
                            ),
                
                'color_theme' : fields.many2one(
                            'color.theme',
                            'Color Theme',
                            required=True,
                            ondelete='cascade',
                            ),
                }
    
    def _check_user(self, cr, uid, ids):
        user_theme = self.search(cr, uid, ['&', ('user', '=', uid), ('id', '!=', ids[0]),])
        print user_theme
        if not user_theme:
            return True
        else:
            return False
        
    _constraints = [(_check_user, 'Error: Another Theme Is Already Defined For You!', ['user']), ] 
    
    
    def create(self, cr, user, vals, context=None):
        rec = {
               'user':user,
               'color_theme':vals['color_theme']
               }
          
        return super(user_theme, self).create(cr, user, rec)
          
        
    
    def get_user_theme(self, cr, uid, context=None):
        user_theme_id = self.pool.get('user.theme').search(cr, uid, [('user', '=', uid),])
        
        if user_theme_id:
            user_theme = self.pool.get('user.theme').browse(cr, uid, user_theme_id[0])
        
            res = {
               'theme_name' : user_theme.color_theme.theme_name,
               'top_bar_gradient_1' : user_theme.color_theme.top_bar_gradient_1,
               'top_bar_gradient_2' : user_theme.color_theme.top_bar_gradient_2,
               'button_gradient_1' : user_theme.color_theme.button_gradient_1,
               'button_gradient_2' : user_theme.color_theme.button_gradient_2,
               'left_bar' : user_theme.color_theme.left_bar,
               'body_font' : user_theme.color_theme.body_font,
               'main_menu_font' : user_theme.color_theme.main_menu_font,
               'sub_menu_font' : user_theme.color_theme.sub_menu_font,
               'top_bar_menu_font' : user_theme.color_theme.top_bar_menu_font,
               'tab_string' : user_theme.color_theme.tab_string,
               'many2one_font' : user_theme.color_theme.many2one_font,
               }
            
            return res
        
        else:
            return None
    
user_theme()
#===================================================================================