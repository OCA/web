# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError

from ..tools import evaluate_python_expression


class WebForm(models.Model):
    _name = "web.form"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _description = "Web Form"

    name = fields.Char(required=True)
    code = fields.Char(required=True)
    form_input_ids = fields.One2many(
        comodel_name="web.form.input", inverse_name="form_id", string="Inputs"
    )
    form_default_ids = fields.One2many(
        comodel_name="web.form.default",
        inverse_name="form_id",
        string="Default Values",
    )
    model_id = fields.Many2one(
        comodel_name="ir.model", required=True, ondelete="cascade"
    )
    mail_template_model_id = fields.Many2one(comodel_name="ir.model")
    mail_template_partner_field_id = fields.Many2one(
        comodel_name="ir.model.fields", domain="mail_template_partner_field_id_domain"
    )
    test_partner_id = fields.Many2one(comodel_name="res.partner")
    url_mail_template = fields.Html(compute="_compute_url_mail_template")
    form_header = fields.Html()
    form_footer = fields.Html()
    mail_template_partner_field_id_domain = fields.Char(
        compute="_compute_mail_template_partner_field_id_domain",
    )
    _sql_constraints = [
        ("unique_code", "unique (code)", "The form code must be unique !")
    ]

    def action_preview(self):
        self.ensure_one()
        if not self.test_partner_id:
            return False
        url = (
            f"/web_form/{self.code}"
            f"/{self.test_partner_id.form_token}"
            f"/{self.test_partner_id.id}"
        )
        return {
            "name": "Preview Form",
            "res_model": "ir.actions.act_url",
            "type": "ir.actions.act_url",
            "target": "new",
            "url": url,
        }

    @api.depends("mail_template_model_id")
    def _compute_mail_template_partner_field_id_domain(self):
        for record in self:
            if (
                not record.mail_template_model_id
                or record.mail_template_model_id.model == "res.partner"
            ):
                domain = [("id", "=", -1)]
            else:
                partner_fields = self.env["ir.model.fields"].search(
                    [
                        ("model_id", "=", record.mail_template_model_id.id),
                        ("ttype", "=", "many2one"),
                        ("relation", "=", "res.partner"),
                    ]
                )
                domain = [("id", "in", partner_fields.ids)]

            record.mail_template_partner_field_id_domain = domain

    @api.onchange("mail_template_model_id")
    def _onchange_mail_template_model_id(self):
        self.ensure_one()
        self.mail_template_partner_field_id = False

    @api.constrains("form_default_ids", "form_input_ids", "model_id")
    def _check_field_model(self):
        for rec in self:
            if (
                rec.form_default_ids.mapped("field_id.model_id") != rec.model_id
                or rec.form_input_ids.mapped("field_id.model_id") != rec.model_id
            ):
                raise ValidationError(_("Form model and field model are different"))

    @api.depends("mail_template_model_id", "mail_template_partner_field_id")
    def _compute_url_mail_template(self):
        self.update({"url_mail_template": False})
        for rec in self.filtered(
            lambda f: (f.mail_template_model_id and f.mail_template_partner_field_id)
            or f.mail_template_model_id.model == "res.partner"
        ):
            if rec.mail_template_model_id.model == "res.partner":
                rec.url_mail_template = (
                    f"/web_form/<strong>{rec.code}</strong>/"
                    f"<code>{{{{ object.form_token }}}}</code>"
                    f"/<code>{{{{ object.id }}}}</code>"
                )
            else:
                partner_field = rec.mail_template_partner_field_id.name
                url = (
                    f"/web_form/<strong>{rec.code}</strong>/"
                    f"<code>{{{{ object.{partner_field}.form_token }}}}</code>"
                    f"/<code>{{{{ object.{partner_field}.id }}}}</code>"
                )
                rec.url_mail_template = url

    def _get_default_values_for_input(self, partner):
        self.ensure_one()
        data = {}
        for form_input in self.form_input_ids:
            if form_input._need_check_value():
                data[form_input.name] = (
                    evaluate_python_expression(
                        form_input.value, {"form": self, "partner": partner}
                    )
                    if form_input.value
                    else ""
                )
            else:
                data[form_input.name] = form_input.value or ""
        return data

    def _get_result_object_values(self, partner, kwargs):
        self.ensure_one()
        values = {}
        for form_input in self.form_input_ids.filtered(
            lambda form: form._need_check_value()
        ):
            if not form_input.readonly and form_input.field_id:
                if kwargs.get(form_input.name):
                    values[form_input.field_id.name] = kwargs[form_input.name]
        for form_default in self.form_default_ids:
            values[form_default.field_id.name] = evaluate_python_expression(
                form_default.value, {"form": self, "partner": partner}
            )
        return values

    def _create_result_object(self, partner, kwargs):
        self.ensure_one()
        values = self._get_result_object_values(partner, kwargs)
        result_object = self.env[self.model_id.model].create(values)
        return result_object

    def _finalize_create_result_object(self, result_object, partner):
        partner._set_form_token()
        return result_object
