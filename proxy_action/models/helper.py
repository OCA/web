# Copyright 2014 Sébastien BEAU <sebastien.beau@akretion.com>
# Copyright 2017 Sylvain CALADOR <sylvain.calador@akretion.com>
# Copyright 2017 Raphaël Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import base64

from odoo import api, models


class ProxyActionHelper(models.AbstractModel):
    _name = "proxy.action.helper"
    _description = "Forward HTTP actions to front-end proxy"

    @api.model
    def get_print_data_action(
        self,
        data,
        printer_name=None,
        raw=False,
        to_encode64=False,
        copies=1,
        host="https://localhost",
    ):
        """ Prepare a PyWebdriver.print action """
        if to_encode64:
            data = base64.b64encode(data)
        kwargs = {"options": {}}
        if copies > 1:
            kwargs["options"]["copies"] = copies
        if raw:
            kwargs["options"]["raw"] = True
        return {
            "url": "%s/cups/printData" % host,
            "params": {"args": [printer_name, data], "kwargs": kwargs},
        }

    @api.model
    def get_print_xml_receipt_action(self, receipt, host="https://localhost"):
        """ Prepare a PyWebdriver.print action """

        return {
            "url": "%s/hw_proxy/print_xml_receipt" % host,
            "params": {"params": {"receipt": receipt}},
        }

    def get_print_report_action(self, records, report_name, **kwargs):
        data = self.env["report"].get_pdf(records.ids, report_name)
        data = base64.b64encode(data)
        return self.get_print_data_action(data, **kwargs)

    def send_proxy(self, todo):
        """ @param todo: list of requests
                         (printings, webservices)
        """
        return {"type": "ir.actions.act_proxy", "action_list": todo}
