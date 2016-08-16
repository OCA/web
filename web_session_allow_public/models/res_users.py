# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp import models


class ResUsers(models.Model):

    _inherit = 'res.users'

    @api.model
    def check(self, passwd):
        """ Catch AccessDenied error and allow public session to proceed """
        if not passwd:
            is_public = self._has_group('base.group_public')
            if is_public:
                return
        return super(ResUsers, self).check(passwd)
