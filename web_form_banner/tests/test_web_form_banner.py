# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo.tests.common import SavepointCase, tagged


@tagged("post_install", "-at_install")
class TestFieldsViewGetPartnerBanner(SavepointCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Partner = cls.env["res.partner"]
        cls.Rule = cls.env["web.form.banner.rule"]
        cls.banner_rule = cls.Rule.search(
            [("model_name", "=", "res.partner")], limit=1,
        )
        if not cls.banner_rule:
            raise AssertionError(
                "Expected a demo web.form.banner.rule for res.partner (active=True) "
                "but none was found. Ensure demo data is loaded."
            )
        cls.partner_form_view = cls.env.ref("base.view_partner_form")

        cls.p_len3 = cls.Partner.create({"name": "Bob"})  # 3
        cls.p_len12 = cls.Partner.create({"name": "Yoshi Tashiro"})  # 12
        cls.p_len22 = cls.Partner.create({"name": "Professor Charles Xavier"})  # 22

    def _get_arch_tree(self, model, view):
        res = model.fields_view_get(
            view_id=view.id,
            view_type="form",
            toolbar=False,
            submenu=False,
        )
        return etree.fromstring(res["arch"])

    def _find_banner_node(self, tree, rule):
        """Find the injected placeholder node for the rule."""
        xpath = "//div[@data-rule-id='%s' and contains(@class,'o_form_banner')]" % rule.id  # noqa: E501
        nodes = tree.xpath(xpath)
        self.assertTrue(nodes, "Expected banner node injected in the form arch.")
        return nodes[0]

    def _get_sibling_indexes(self):
        tree = self._get_arch_tree(self.Partner, self.partner_form_view)
        banner_node = self._find_banner_node(tree, self.banner_rule)
        targets = tree.xpath(self.banner_rule.target_xpath)
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
        banner_node = self._find_banner_node(tree, self.banner_rule)
        # Basic attributes from the server injection
        self.assertEqual(banner_node.get("data-model"), "res.partner")
        self.assertEqual(
            banner_node.get("data-default-severity"), self.banner_rule.severity
        )
        self.assertEqual(banner_node.get("role"), "alert")
        self.assertEqual(banner_node.get("style"), "display:none;")
        # Class list includes the expected CSS classes
        classes = (banner_node.get("class") or "").split()
        for required in (
            "o_form_banner", "alert", "alert-%s" % (self.banner_rule.severity)
        ):
            self.assertIn(required, classes)
        # Ensure it's not duplicated
        all_banners = tree.xpath("//div[contains(@class,'o_form_banner')]")
        self.assertEqual(len(all_banners), 1)

    def test_position_relative_to_sheet(self):
        self.banner_rule.position = "before"
        i_target, i_banner_node = self._get_sibling_indexes()
        self.assertEqual(
            i_banner_node, i_target - 1,
            "Banner should be inserted immediately before <sheet>"
        )
        self.banner_rule.position = "after"
        i_target, i_banner_node = self._get_sibling_indexes()
        self.assertEqual(
            i_banner_node, i_target + 1,
            "Banner should be inserted immediately after <sheet>"
        )

    def test_not_injected_on_unrelated_model(self):
        Company = self.env["res.company"]
        view = self.env.ref("base.view_company_form")
        res = Company.fields_view_get(view_id=view.id, view_type="form")
        tree = etree.fromstring(res["arch"])
        self.assertFalse(tree.xpath("//div[contains(@class,'o_form_banner')]"))

    def test_contains_expected_messages_and_severities(self):
        code = (self.banner_rule.message_value_code or "").strip()
        self.assertIn("This partner's name is very long!", code)
        self.assertIn("This partner's name is a bit long.", code)
        self.assertRegex(code, r"['\"]danger['\"]", "Missing 'danger' literal")
        self.assertRegex(code, r"['\"]warning['\"]", "Missing 'warning' literal")

    def test_banner_visibility_and_content(self):
        # Short name: no banner
        out = self.Rule.compute_message(
            self.banner_rule.id, "res.partner", self.p_len3.id
        )
        self.assertFalse(out.get("visible"))
        # Medium name: warning banner
        out = self.Rule.compute_message(
            self.banner_rule.id, "res.partner", self.p_len12.id
        )
        self.assertTrue(out.get("visible"))
        self.assertEqual(out.get("severity"), "warning")
        self.assertIn("bit long", out.get("html", ""))
        # Long name: danger banner
        out = self.Rule.compute_message(
            self.banner_rule.id, "res.partner", self.p_len22.id
        )
        self.assertTrue(out.get("visible"))
        self.assertEqual(out.get("severity"), "danger")
        self.assertIn("very long", out.get("html", ""))

    def test_inactive_rule_returns_hidden(self):
        # Flip active off just for this check
        self.banner_rule.active = False
        try:
            out = self.Rule.compute_message(
                self.banner_rule.id, "res.partner", self.p_len22.id
            )
            self.assertFalse(out.get("visible"))
        finally:
            self.banner_rule.active = True

    def test_compute_message_with_unsaved_changes(self):
        """Server must evaluate using form_vals (unsaved draft) when provided."""
        out = self.Rule.compute_message(
            self.banner_rule.id, "res.partner", self.p_len3.id
        )
        self.assertFalse(out.get("visible"), "Short name should not show banner")
        # Pretend user typed a long name but hasn't saved yet
        form_vals = {"name": "Professor XXXXXXXXX"}
        out = self.Rule.compute_message(
            self.banner_rule.id, "res.partner", self.p_len3.id, form_vals=form_vals
        )
        self.assertTrue(out.get("visible"), "Unsaved long name should show banner")
        self.assertEqual(out.get("severity"), "warning")
        self.assertIn("bit long", out.get("html", ""))
