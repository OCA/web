# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models


class ResUsers(models.Model):

    _inherit = 'res.users'

    def check(self, db, uid, passwd):
        """ Catch AccessDenied error and allow public session to proceed """
        if not passwd:
            cr = self.pool.cursor()
            try:
                is_public = self._has_group(cr, uid, 'base.group_public')
                if is_public:
                    return
            finally:
                cr.close()
        return super(ResUsers, self).check(db, uid, passwd)
