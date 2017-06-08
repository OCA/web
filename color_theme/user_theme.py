from openerp.osv import orm, fields, osv


class user_theme(orm.Model):
    """This Model To Assign Previously Stored Color Theme To User"""

    _name = 'user.theme'

    _rec_name = 'user'

    _columns = {'user': fields.many2one('res.users',
                                        'User Name',
                                        required=True,
                                        ondelete='cascade', ),

                'color_theme': fields.many2one('color.theme',
                                               'Color Theme',
                                               required=True,
                                               ondelete='cascade', ),
                }

    def name_get(self, cr, uid, ids, context=None):
        """this function used to get record name in form view"""
        res = []
        if not ids:
            return []

        aux = ''
        for rec in self.browse(cr, uid, ids, context):
            aux = '( ' + rec.color_theme.user.name + ' ) / '
            aux = aux + rec.color_theme.theme_name
            res.append((rec.id, aux))

        return res

    def _check_user(self, cr, uid, ids, context=None):
        user_theme = self.search(cr, uid, [('user', '=', uid),
                                           ('id', '!=', ids[0]), ],
                                 context)

        return bool(not user_theme)

    def _update_check_user(self, cr, uid, ids, context=None):
        rec = self.browse(cr, uid, ids[0], context)

        if rec.user.id == uid:
            return True
        else:
            return False

    _constraints = [(_update_check_user,
                     'Error: You are not the owner!',
                     ['user']),
                    (_check_user,
                     'Error: Another Theme Is Already Defined For You!',
                     ['user']), ]

    def create(self, cr, user, vals, context=None):
        vals.update({'user': user})
        return super(user_theme, self).create(cr, user, vals, context)

    def unlink(self, cr, uid, ids, context=None):
        if uid == 1:
            return super(user_theme, self).unlink(cr, uid, ids,
                                                  context=context)
        else:
            recs = self.browse(cr, uid, ids, context)
            for rec in recs:
                if rec.user.id != uid:
                    raise osv.except_osv(('Delete Error'),
                                         ('Only theme owner can delete it'))

            return super(user_theme, self).unlink(cr, uid, ids,
                                                  context=context)

    def get_user_theme(self, cr, uid, context=None):
        user_theme_id = self.search(cr, uid, [('user', '=', uid), ], context)
        if user_theme_id:
            user_theme = self.browse(cr, uid, user_theme_id[0], context)

            return self.pool.get('color.theme').read(cr, uid,
                                                     user_theme.color_theme.id,
                                                     context)

        else:
            return None
