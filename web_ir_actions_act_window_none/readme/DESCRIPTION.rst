===========
Noop action
===========

This module was written to have an action that does nothing. A notorious case
where this is useful is buttons on popup windows, because they need to return
an action. Given the default here is `ir.actions.act_window_close`, you'll
have to jump through some hoops if you have a button that is not supposed to
close the popup window.
