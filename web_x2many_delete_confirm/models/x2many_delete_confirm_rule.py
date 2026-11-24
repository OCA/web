# Copyright 2026 - TODAY, Cristiano Mafra Junior <cristiano.mafra@escodoo.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class X2manyDeleteConfirmRule(models.Model):
    _name = "x2many.delete.confirm.rule"
    _description = "x2many Delete Confirmation Rule"
    _order = "sequence, id"

    name = fields.Char(required=True)
    sequence = fields.Integer(
        default=10,
        help="When several rules match the same line model, the first one wins.",
    )
    active = fields.Boolean(default=True)
    model_id = fields.Many2one(
        comodel_name="ir.model",
        string="Line Model",
        required=True,
        ondelete="cascade",
        help="Model of the records listed in the x2many field, e.g. "
        "'purchase.order.line'. The confirmation is asked whenever one of "
        "those lines is removed from its parent form.",
    )
    parent_model_id = fields.Many2one(
        comodel_name="ir.model",
        string="Parent Model",
        ondelete="cascade",
        help="Optional. Restricts the rule to lines displayed on this parent "
        "model only, e.g. 'purchase.order'. Leave it empty to apply the rule "
        "on every form showing this line model.",
    )
    title = fields.Char(
        translate=True,
        help="Title of the confirmation dialog. Leave it empty to use the "
        "default title, translated in the language of each user.",
    )
    message = fields.Text(
        translate=True,
        help="Question the user has to answer. Leave it empty to use the "
        "default question, translated in the language of each user.",
    )
    group_ids = fields.Many2many(
        comodel_name="res.groups",
        string="Groups",
        help="Ask for confirmation only to the users in these groups. "
        "Leave empty to apply the rule to every user.",
    )
    company_id = fields.Many2one(
        comodel_name="res.company",
        string="Company",
        help="Leave empty to apply the rule in every company.",
    )

    @api.model
    def _get_rules_for_user(self):
        """Return the rules the current user is subject to.

        The result is injected in the session information and consumed by the
        ``x2many_delete_confirm`` JS service, so it must stay a plain,
        JSON-serializable dict keyed by the *line* model::

            {"purchase.order.line": [{"parent_model": "purchase.order",
                                      "title": "...", "message": "..."}]}

        An empty title or message is sent as ``False``: the client then falls
        back to its own translated default. Rules come out ordered by
        ``sequence``, so the client can simply take the first match.
        """
        rules = self.sudo().search(
            [
                "|",
                ("company_id", "=", False),
                ("company_id", "in", self.env.companies.ids),
                "|",
                ("group_ids", "=", False),
                ("group_ids", "in", self.env.user.groups_id.ids),
            ]
        )
        result = {}
        for rule in rules:
            result.setdefault(rule.model_id.model, []).append(
                {
                    "parent_model": rule.parent_model_id.model or False,
                    "title": rule.title or False,
                    "message": rule.message or False,
                }
            )
        return result
