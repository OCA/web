# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestFieldsViewGetPartnerBanner(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Partner = cls.env["res.partner"]
        cls.Rule = cls.env["web.form.banner.rule"]
        existing_rules = cls.Rule.search([])
        cls._disabled_rule_ids = existing_rules.ids
        if existing_rules:
            existing_rules.write({"active": False})
        partner_model_id = cls.env["ir.model"]._get("res.partner").id
        cls.rule_name = cls.Rule.create(
            {
                "name": "Partner name length notice",
                "model_id": partner_model_id,
                "message_value_code": """
name = (record.name or "").strip()
n = len(name)
if n > 20:
    result = {
        "visible": True,
        "severity": "danger",
        "html": "Name too long!",
    }
elif n > 10:
    result = {
        "visible": True,
        "severity": "warning",
        "html": "Name a bit long.",
    }
else:
    result = {"visible": False}
            """,
            }
        )
        cls.rule_email = cls.Rule.create(
            {
                "name": "Partner email missing notice (dynamic)",
                "model_id": partner_model_id,
                "message": "Email missing!",
                "message_value_code": "{'visible': not bool(draft.email)}",
                "active": False,  # disable to avoid interference in most tests
            }
        )
        cls.rule_tag = cls.Rule.create(
            {
                "name": "Partner tag missing notice (dynamic)",
                "model_id": partner_model_id,
                "message": "Missing tag!",
                "message_value_code": "{'visible': not bool(draft.category_id)}",
                "active": False,  # disable to avoid interference in most tests
            }
        )
        cls.partner_form_view = cls.env.ref("base.view_partner_form")
        cls.p_len3 = cls.Partner.create({"name": "Bob"})  # 3
        cls.p_len12 = cls.Partner.create({"name": "Yoshi Tashiro"})  # 12
        cls.p_len22 = cls.Partner.create({"name": "Professor Charles Xavier"})  # 22

    @classmethod
    def tearDownClass(cls):
        # restore previously active rules
        if getattr(cls, "_disabled_rule_ids", None):
            cls.Rule.browse(cls._disabled_rule_ids).exists().write({"active": True})
        super().tearDownClass()

    def _get_arch_tree(self, model, view):
        res = model.get_view(view_id=view.id, view_type="form")
        return etree.fromstring(res["arch"])

    def _find_banner_node(self, tree, rule):
        """Find the injected placeholder node for the rule."""
        xpath = f"//div[@data-rule-id='{rule.id}' and contains(@class,'o_form_banner')]"
        nodes = tree.xpath(xpath)
        self.assertTrue(nodes, "Expected banner node injected in the form arch.")
        return nodes[0]

    def _get_sibling_indexes(self):
        tree = self._get_arch_tree(self.Partner, self.partner_form_view)
        banner_node = self._find_banner_node(tree, self.rule_name)
        targets = tree.xpath(self.rule_name.target_xpath)
        self.assertTrue(targets)
        target = targets[0]
        parent = target.getparent()
        self.assertIsNotNone(parent)
        # Banner and sheet should share the same parent
        self.assertIs(parent, banner_node.getparent())
        siblings = list(parent)
        return siblings.index(target), siblings.index(banner_node)

    def _code(self, rule):
        return (rule.message_value_code or "").strip()

    def test_injected_once_with_expected_attrs(self):
        tree = self._get_arch_tree(self.Partner, self.partner_form_view)
        banner_node = self._find_banner_node(tree, self.rule_name)
        # Basic attributes from the server injection
        self.assertEqual(banner_node.get("data-model"), "res.partner")
        self.assertEqual(banner_node.get("role"), "status")
        # Class list includes the expected CSS classes
        classes = (banner_node.get("class") or "").split()
        for required in ("o_form_banner", "alert", "o_invisible_modifier"):
            self.assertIn(required, classes)
        # Ensure it's not duplicated
        all_banners = tree.xpath("//div[contains(@class,'o_form_banner')]")
        self.assertEqual(len(all_banners), 1)

    def test_position_relative_to_sheet(self):
        self.rule_name.position = "before"
        i_target, i_banner_node = self._get_sibling_indexes()
        self.assertEqual(
            i_banner_node,
            i_target - 1,
            "Banner should be inserted immediately before <sheet>",
        )
        self.rule_name.position = "after"
        i_target, i_banner_node = self._get_sibling_indexes()
        self.assertEqual(
            i_banner_node,
            i_target + 1,
            "Banner should be inserted immediately after <sheet>",
        )

    def test_not_injected_on_unrelated_model(self):
        Company = self.env["res.company"]
        view = self.env.ref("base.view_company_form")
        res = Company.get_view(view_id=view.id, view_type="form")
        tree = etree.fromstring(res["arch"])
        self.assertFalse(tree.xpath("//div[contains(@class,'o_form_banner')]"))

    def test_contains_expected_messages_and_severities(self):
        code = (self.rule_name.message_value_code or "").strip()
        self.assertIn("Name too long!", code)
        self.assertIn("Name a bit long.", code)
        self.assertRegex(code, r"['\"]danger['\"]", "Missing 'danger' literal")
        self.assertRegex(code, r"['\"]warning['\"]", "Missing 'warning' literal")

    def test_banner_visibility_and_content(self):
        # Short name: no banner
        out = self.Rule.compute_message(
            self.rule_name.id, "res.partner", self.p_len3.id
        )
        self.assertFalse(out.get("visible"))
        # Medium name: warning banner
        out = self.Rule.compute_message(
            self.rule_name.id, "res.partner", self.p_len12.id
        )
        self.assertTrue(out.get("visible"))
        self.assertEqual(out.get("severity"), "warning")
        self.assertIn("bit long", out.get("html", ""))
        # Long name: danger banner
        out = self.Rule.compute_message(
            self.rule_name.id, "res.partner", self.p_len22.id
        )
        self.assertTrue(out.get("visible"))
        self.assertEqual(out.get("severity"), "danger")
        self.assertIn("too long", out.get("html", ""))

    def test_inactive_rule_returns_hidden(self):
        # Flip active off just for this check
        self.rule_name.active = False
        try:
            out = self.Rule.compute_message(
                self.rule_name.id, "res.partner", self.p_len22.id
            )
            self.assertFalse(out.get("visible"))
        finally:
            self.rule_name.active = True

    def test_compute_message_dynamic_simple_field(self):
        self.rule_email.active = True
        out = self.Rule.compute_message(
            self.rule_email.id, "res.partner", self.p_len3.id, form_vals={"email": ""}
        )
        self.assertTrue(out.get("visible"))
        self.assertIn("Email missing!", out.get("html"))
        out = self.Rule.compute_message(
            self.rule_email.id,
            "res.partner",
            self.p_len3.id,
            form_vals={"email": "test@example.com"},
        )
        self.assertFalse(out.get("visible"))

    def test_compute_message_dynamic_m2m(self):
        self.rule_tag.active = True
        tag = self.env["res.partner.category"].create({"name": "test tag"})
        out = self.Rule.compute_message(
            self.rule_tag.id,
            "res.partner",
            self.p_len3.id,
            form_vals={"category_id": []},
        )
        self.assertTrue(out.get("visible"))
        self.assertIn("Missing tag!", out.get("html"))
        out = self.Rule.compute_message(
            self.rule_tag.id,
            "res.partner",
            self.p_len3.id,
            form_vals={"category_id": [tag.id]},
        )
        self.assertFalse(out.get("visible"))
