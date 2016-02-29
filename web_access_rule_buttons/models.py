# -*- coding: utf-8 -*-
# © 2016 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

from openerp import models, api, exceptions


@api.multi
def check_access_rule_all(self, operations=None):
    """Verifies that the operation given by ``operations`` is allowed for the
    user according to ir.rules.

    If ``operations`` is empty, it returns the result for all actions.

   :param operation: a list of ``read``, ``create``, ``write``, ``unlink``
   :return: {operation: access} (access is a boolean)
    """
    if operations is None:
        operations = ['read', 'create', 'write', 'unlink']
    result = {}
    for operation in operations:
        if self.is_transient() and not self.ids:
            # If we call check_access_rule() without id, it will try to run a
            # SELECT without ID which will crash, so we just blindly allow the
            # operations
            result[operation] = True
            continue
        try:
            self.check_access_rule(operation)
        except exceptions.AccessError:
            result[operation] = False
        else:
            result[operation] = True
    return result


models.BaseModel.check_access_rule_all = check_access_rule_all
