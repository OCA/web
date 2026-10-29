# Copyright 2026 Domatix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class Base(models.AbstractModel):
    _inherit = "base"

    def grid_update_cell(self, *args, **kwargs):
        """Override to enable inline cell editing in grid views.

        Called when a cell value is modified. The default behaviour disables
        editing (a model must override this method to implement the update).
        When another module also defines it (e.g. Enterprise ``web_grid``),
        defer to that implementation so the two can coexist in the same
        database.
        """
        super_method = getattr(super(), "grid_update_cell", None)
        if super_method is not None:
            return super_method(*args, **kwargs)
        raise NotImplementedError(
            "grid_update_cell must be overridden to enable cell editing"
        )

    # ``grid_unavailability`` is intentionally NOT defined here: the Community
    # grid view does not call it, and declaring it on ``base`` would collide
    # with Enterprise's ``web_grid`` when both are installed. A Community model
    # that needs to grey out days may override ``grid_unavailability`` itself.
