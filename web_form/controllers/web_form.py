# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import http
from odoo.http import request


class WebForm(http.Controller):
    def _prepare_controller_params(self, form_code, form_token, partner_id):
        form = request.env["web.form"].sudo().search([("code", "=", form_code)])
        partner = request.env["res.partner"].sudo().search([("id", "=", partner_id)])
        if not form or not partner:
            return (
                form,
                partner,
                request.render("web_form.form_not_found"),
            )
        if partner.form_token != form_token:
            return (
                form,
                partner,
                request.render("web_form.form_expired"),
            )
        return form, partner, None

    @http.route(
        [
            "/form",
            "/form/<string:form_code>",
            "/form/<string:form_code>/<string:form_token>",
        ],
        type="http",
        auth="public",
        methods=["GET"],
        website=True,
    )
    def form_wrong_url(self, **kwargs):
        return request.render("web_form.form_not_found")

    @http.route(
        "/web_form/<string:form_code>/" "<string:form_token>/<int:partner_id>",
        type="http",
        auth="public",
        methods=["GET"],
        website=True,
    )
    def web_form(self, form_code, form_token, partner_id, **kwargs):
        form, partner, render = self._prepare_controller_params(
            form_code, form_token, partner_id
        )
        if render:
            return render
        try:
            form._get_default_values_for_input(partner)
        except Exception as e:  # pylint: disable=broad-except
            form.message_post(body=e.args[0])
            return request.render("web_form.form_unknown_issue")
        return request.render(
            "web_form.web_form",
            {
                "form": form,
                "partner": partner,
                "data": form._get_default_values_for_input(partner),
            },
        )

    @http.route(
        "/web_form_create/<string:form_code>/" "<string:form_token>/<int:partner_id>",
        type="http",
        auth="public",
        methods=["POST"],
        website=True,
    )
    def web_form_create(self, form_code, form_token, partner_id, **kwargs):
        form, partner, render = self._prepare_controller_params(
            form_code, form_token, partner_id
        )
        if render:
            return render
        try:
            with request.cr.savepoint():
                result_object = form._create_result_object(partner, kwargs)
                form._finalize_create_result_object(result_object, partner)
        except Exception as e:  # pylint: disable=broad-except
            form.message_post(body=e.args[0])
            return request.render("web_form.form_unknown_issue")
        return request.render("web_form.form_thank_you")
