from openerp.osv import orm, fields, osv


class color_theme(orm.Model):
    """This Model To Store Color Themes To be Selected Later"""

    _name = 'color.theme'

    _rec_name = 'theme_name'

    _columns = {'theme_name': fields.char('Theme Name',
                                          size=128,
                                          required=True, ),

                'user': fields.many2one('res.users',
                                        'User Name',
                                        required=True,
                                        ondelete='cascade', ),

                'top_bar_gradient_1':
                fields.char('Top Bar Gradient First Color',
                            size=6, ),

                'top_bar_gradient_2':
                fields.char('Top Bar Gradient Second Color',
                            size=6, ),

                'button_gradient_1':
                fields.char('Button Background Gradient First Color',
                            size=6, ),

                'button_gradient_2':
                fields.char('Button Background Gradient Second Color',
                            size=6, ),

                'left_bar': fields.char('Left Bar Color',
                                        size=6, ),

                'body_font': fields.char('Body Font Color',
                                         size=6, ),

                'main_menu_font': fields.char('Main Menu Font Color',
                                              size=6, ),

                'sub_menu_font': fields.char('Sub Menu Font Color',
                                             size=6, ),

                'top_bar_menu_font': fields.char('Top Bar Menu Font Color',
                                                 size=6, ),

                'tab_string': fields.char('Tab String Font Color',
                                          size=6, ),

                'many2one_font': fields.char('Link Color',
                                             size=6, ),
                }

    _sql_constraints = [('unique_theme_name',
                         'unique(theme_name)',
                         'Theme With The Same Name Already Exists'), ]

    def _check_user(self, cr, uid, ids, context=None):
        rec = self.browse(cr, uid, ids[0], context)

        if rec.user.id == uid or uid == 1:
            return True
        else:
            return False

    _constraints = [(_check_user,
                     'Error: You are not the owner of theme',
                     ['user']), ]

    def create(self, cr, user, vals, context=None):
        vals.update({'user': user})
        return super(color_theme, self).create(cr, user, vals, context)

    def unlink(self, cr, uid, ids, context=None):
        if uid == 1:
            return super(color_theme, self).unlink(cr, uid, ids,
                                                   context=context)
        else:
            recs = self.browse(cr, uid, ids, context)
            for rec in recs:
                if rec.user.id != uid:
                    raise osv.except_osv(('Delete Error'),
                                         ('You are not the owner of theme'))

            return super(color_theme, self).unlink(cr, uid, ids,
                                                   context=context)
