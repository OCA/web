# Copyright 2025 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo.tests.common import TransactionCase
from odoo.tools.safe_eval import safe_eval


class Common(TransactionCase):
    @classmethod
    def _create_opt(cls, model_name, field_name, vals=None):
        field = cls._get_field(model_name, field_name)
        vals = dict(vals or [])
        return cls.env["m2x.create.edit.option"].create(dict(field_id=field.id, **vals))

    @classmethod
    def _get_field(cls, model_name, field_name):
        return cls.env["ir.model.fields"]._get(model_name, field_name)

    @classmethod
    def _get_model(cls, model_name):
        return cls.env["ir.model"]._get(model_name)

    @classmethod
    def _eval_node_options(cls, node):
        opt = node.attrib.get("options") or {}
        if isinstance(opt, str):
            return safe_eval(opt, cls._get_node_options_eval_context(), nocopy=True)
        return {}

    @classmethod
    def _get_node_options_eval_context(cls):
        eval_ctx = dict(cls.env.context or [])
        eval_ctx.update({"context": dict(eval_ctx), "true": True, "false": False})
        return eval_ctx

    @classmethod
    def _get_test_view(cls):
        return cls.env.ref("web_m2x_options_manager.res_partner_demo_form_view")

    @classmethod
    def _get_test_view_fields_view_get(cls):
        return cls.env["res.partner"].get_view(cls._get_test_view().id)

    @classmethod
    def _get_test_view_parsed(cls):
        return etree.XML(cls._get_test_view_fields_view_get()["arch"])
