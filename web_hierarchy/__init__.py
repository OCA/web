# -*- coding: utf-8 -*-
#   Copyright 2019 Kevin Kamau
#   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from . import models

# To be called when uninstalling the module
# should be defined in __init__.py not a separate file.


def uninstall_hook(cr, registry):
    cr.execute("UPDATE ir_act_window "
               "SET view_mode=replace(view_mode, ',hierarchy', '')"
               "WHERE view_mode LIKE '%,hierarchy%';")
    cr.execute("UPDATE ir_act_window "
               "SET view_mode=replace(view_mode, 'hierarchy,', '')"
               "WHERE view_mode LIKE '%hierarchy,%';")
    cr.execute("DELETE FROM ir_act_window "
               "WHERE view_mode = 'hierarchy';")
    cr.execute("DELETE FROM ir_act_window_view "
               "WHERE view_mode = 'hierarchy';")
