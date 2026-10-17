# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from collections import defaultdict

from odoo import api, fields, models


class QuicktStartScreen(models.Model):
    _name = "quick.start.screen"
    _description = "Quick action selection screen"

    name = fields.Char(translate=True)
    action_ids = fields.Many2many(comodel_name="quick.start.screen.action")

    @api.model
    @api.ormcache("frozenset(self.env.user._get_group_ids())")
    def _visible_action_ids(self):
        """Inspired on how menus visibility work in core"""
        screen_actions = self.action_ids.search([]).sudo()  # pylint: disable=no-search-all
        visible = self.action_ids.browse()
        MODEL_BY_TYPE = {
            "ir.actions.act_window": "res_model",
            "ir.actions.report": "model",
            "ir.actions.server": "model_name",
        }
        # performance trick: determine the ids to prefetch by type
        prefetch_ids = defaultdict(list)
        for action in screen_actions.mapped("action_ref_id"):
            prefetch_ids[action._name].append(action.id)
        for screen_action in screen_actions:
            action = screen_action.action_ref_id
            action = action.with_prefetch(prefetch_ids[action._name])
            model_name = (
                action._name in MODEL_BY_TYPE and action[MODEL_BY_TYPE[action._name]]
            )
            if not model_name or (
                (model := self.env.get(model_name)) is not None
                and model.has_access("read")
            ):
                visible += screen_action
        return set(visible.ids)

    def _prepare_screen_action(self):
        return {
            "display_name": self.name or self.env._("Start"),
            "name": self.name or self.env._("Start"),
            "res_model": "quick.start.screen.action",
            "target": "current",
            "type": "ir.actions.act_window",
            "view_mode": "kanban",
            "views": [
                [
                    self.env.ref(
                        "web_quick_start_screen.quick_start_screen_action_kanban"
                    ).id,
                    "kanban",
                ]
            ],
        }

    def action_screen_actions(self):
        """Normally called from a server action"""
        screen = (
            self
            or self.env.user.quick_start_screen_id
            or self.browse(self.env.context.get("default_quick_start_screen_id"))
        )
        action = screen._prepare_screen_action()
        visible_actions = set(screen.action_ids.ids) & screen._visible_action_ids()
        action["domain"] = [("id", "in", list(visible_actions))]
        return action
