import ast

from odoo import Command, _, api, fields, models


class DisableRemainingDaysRule(models.Model):
    _name = "disable.remaining.days.rule"
    _description = "Disable Remaining Days Rule"

    res_model_id = fields.Many2one(
        "ir.model",
        string="Model",
        required=True,
        ondelete="cascade",
        copy=False,
        help="Select the model where you want to disable the remaining days widget.",
    )
    res_model_name = fields.Char(
        related="res_model_id.model",
        string="Technical model name",
        store=True,
    )
    active = fields.Boolean(string="Active record", default=True)
    company_id = fields.Many2one(
        "res.company",
        required=True,
        default=lambda self: self.env.company,
        string="Company",
    )
    diseable_view_types = fields.Char(
        string="Disable View Types",
        compute="_compute_diseable_view_types",
        store=True,
        help="Name of the view types where the remaining days widget will be disabled.",
    )
    diseable_view_types_json = fields.Char(
        string="Disable View Types JSON",
        readonly=True,
        help="JSON representation of the view types where the remaining days"
        " widget will be disabled. {'list': List, 'form': Form}",
    )
    date_type_fields_ids = fields.Many2many(
        "ir.model.fields",
        string="Date/Datetime Fields",
        help="Select the date/datetime fields of the model where you want to disable"
        " the remaining days widget.",
        domain="[('model_id', '=', res_model_id),"
        " ('ttype', 'in', ['date', 'datetime'])]",
        copy=False,
    )

    @api.depends("diseable_view_types_json")
    def _compute_diseable_view_types(self):
        """
        Get Values of diseable_view_types_json
        """
        for record in self:
            # Convert chart to json array
            diseable_view_types_json = ast.literal_eval(
                record.diseable_view_types_json or "{}"
            )
            # Get values of dict
            view_types = []
            for value in diseable_view_types_json.values():
                if value:
                    view_types.append(value)
            record.diseable_view_types = ", ".join(view_types)

    @api.constrains("res_model_id")
    def _constrains_res_model_id(self):
        """Ensure that there is only one rule per model"""
        for record in self:
            domain = [
                ("res_model_id", "=", record.res_model_id.id),
                ("id", "!=", record.id),
                ("company_id", "=", record.company_id.id),
            ]
            if self.search_count(domain) > 0:
                raise models.ValidationError(
                    self.env._(
                        "There is already a rule for the model '%s'."
                        " You cannot create two rules for the same model.",
                        record.res_model_id.name,
                    )
                )

    @api.onchange("res_model_id")
    def _onchange_res_model_id(self):
        """ " On change of the model, reset the date field"""
        for record in self:
            record.date_type_fields_ids = False

    def action_open_set_disable_remaining_days_rule_wizard(self):
        """
        Open the wizard to set the disable remaining days rule
        """
        self.ensure_one()
        model_id = self.res_model_id
        view_ids = model_id.view_ids
        if not view_ids:
            raise models.ValidationError(
                _(
                    "The model '%s' does not have any views."
                    " You cannot set the disable remaining days rule by view type"
                    " for this model."
                )
                % model_id.name
            )
        IrUiView = self.env["ir.ui.view"]
        # Get selection from ir.ui.view.
        selection = IrUiView._fields["type"].selection
        view_types = []
        for technical_name, name in selection:
            selected = technical_name in ast.literal_eval(
                self.diseable_view_types_json or "{}"
            )
            view_types.append((name, technical_name, selected))
        wizard_id = (
            self.env["disable.remaining.days.rule.wizard"]
            .sudo()
            .create(
                {
                    "disable_remaining_days_rule_id": self.id,
                    "line_ids": [
                        Command.create(
                            {
                                "name": name,
                                "technical_name": technical_name,
                                "selected": selected,
                            },
                        )
                        for name, technical_name, selected in view_types
                    ],
                }
            )
        )
        # Return wizard created
        return {
            "type": "ir.actions.act_window",
            "view_mode": "form",
            "res_model": "disable.remaining.days.rule.wizard",
            "target": "new",
            "res_id": wizard_id.id,
        }

    @api.model
    def get_all_rules(self):
        """
        Get all rules like {'model_name': active}
        """
        # Return one rule per model if some company has it active
        rules_ids = self.search([])
        if self.get_disable_all_models():
            # If all models are disabled, return True for all
            return True
        rules = {}
        for rule in rules_ids:
            view_types = rule.get_data_by_view_type()
            fields = rule.get_data_by_field()
            rules[rule.res_model_id.model] = {
                "model": rule.get_data_by_model()
                if not view_types and not fields
                else False,
                "view_types": view_types,
                "fields": fields,
            }
        return rules

    def get_data_by_model(self):
        """
        Get rule data for a specific model
        """
        self.ensure_one()
        return self.active

    def get_data_by_view_type(self):
        """
        Get rule data for a specific model and view type
        """
        self.ensure_one()
        diseable_view_types_json = ast.literal_eval(
            self.diseable_view_types_json or "{}"
        )
        key_list = list(diseable_view_types_json.keys())
        if not key_list:
            return []
        return key_list

    def get_data_by_field(self):
        """
        Get rule data for a specific model and field
        """
        self.ensure_one()
        field_ids = self.date_type_fields_ids
        if not field_ids:
            return []
        return field_ids.mapped("name")

    @api.model
    def get_disable_all_models(self):
        """
        Get all models with the remaining days disabled
        :return: list of model names
        """
        disable_remaining_days = self.env.company.disable_remaining_days
        if disable_remaining_days:
            return True
        return False
