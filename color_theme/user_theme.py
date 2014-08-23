from openerp.osv import orm, fields
# ===============================User Theme Model===============================================
class user_theme(orm.Model):
	"""This Model To Assign Previously Stored Color Theme To User"""


	_name = 'user.theme'

	_rec_name = 'user'

	_columns = {
		'user': fields.many2one('res.users', 'User Name', required=True, ondelete='cascade', ),

		'color_theme': fields.many2one('color.theme', 'Color Theme', required=True, ondelete='cascade', ),
		}

	def _check_user(self, cr, uid, ids, context=None):
		user_theme = self.search(cr, uid, [('user', '=', uid), ('id', '!=', ids[0]),], context)

		return bool(not user_theme)

	_constraints = [(_check_user, 'Error: Another Theme Is Already Defined For You!', ['user']), ] 


	def create(self, cr, user, vals, context=None):
		rec = {
			'user':user,
			'color_theme':vals['color_theme']
		}

		return super(user_theme, self).create(cr, user, rec, context)



	def get_user_theme(self, cr, uid, context=None):
		user_theme_id = self.search(cr, uid, [('user', '=', uid),], context)
		if user_theme_id:
			user_theme = self.browse(cr, uid, user_theme_id[0], context)

			return self.pool.get('color.theme').read(cr, uid, user_theme.color_theme.id, context)

		else:
			return None

# ===================================================================================
