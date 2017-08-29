# -*- coding: utf-8 -*-
# © 2016 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

from odoo import models, api, exceptions


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
        # If we're writing on a new o2m, m2m or m2o record related to a new
        # record (for example an invoice line created altogether with the
        # invoice to which it belongs), ids contains a string. Calling
        # check_access_rule() in this condition will crash, so we just
        # blindly allow the operations.
        try:
            for id in self.ids:
                int(id)
        except Exception:
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
