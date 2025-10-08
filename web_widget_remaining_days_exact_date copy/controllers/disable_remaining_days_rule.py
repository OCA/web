from odoo import http
from odoo.http import request


class DisableRemainingDaysRuleController(http.Controller):
    @http.route(
        ["/disable_remaining_days_rule/get_data"],
        type="json",
        auth="user",
    )
    def disable_remaining_days_rule_get_data(
        self,
        **kwargs,
    ):
        """
        Get data for the module 'web_widget_remaining_days_exact_date'
        :return: dict with data
        :rtype: dict

        EXAMPLE RETURN:
        {'sale.order': True}
        In this example the widget will be disabled for the model 'sale.order'
        """
        # Search rules
        rules = request.env["disable.remaining.days.rule"].get_all_rules()
        return rules
