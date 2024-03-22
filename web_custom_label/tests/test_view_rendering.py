# © 2023 Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from ddt import data, ddt, unpack
from lxml import etree

from odoo.tests import common

EN_NAME_LABEL = "My Custom Label"
FR_NAME_LABEL = "Mon Libellé Personnalisé"

EN_XPATH_LABEL = "My Other Custom Label"
FR_XPATH_LABEL = "Mon Autre Libellé Personnalisé"

EN_NAME_PLACEHOLDER = "My Custom Placeholder"
FR_NAME_PLACEHOLDER = "Mon Placeholder Personnalisé"

EN_LANG_LABEL = "My Custom Lang Label"
FR_LANG_LABEL = "Mon Libellé de langue"

EN_SELECTION_LABEL = "My custom label for partner of type contact"
FR_SELECTION_LABEL = "Mon libellé pour les contacts de type personne"

EN_HELP_LABEL = "My custom helper"
FR_HELP_LABEL = "Mon aide personnalisé"


@ddt
class TestViewRendering(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env.ref("base.lang_fr").write({"active": True})

        cls.view = cls.env.ref("base.view_partner_form")
        cls.env["web.custom.label"].create(
            {
                "lang": "en_US",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "name",
                "term": EN_NAME_LABEL,
                "position": "string",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "fr_FR",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "name",
                "term": FR_NAME_LABEL,
                "position": "string",
            }
        )

        cls.xpath = "//field[@name='email']"

        cls.env["web.custom.label"].create(
            {
                "lang": "en_US",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "xpath",
                "reference": cls.xpath,
                "term": EN_XPATH_LABEL,
                "position": "string",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "fr_FR",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "xpath",
                "reference": cls.xpath,
                "term": FR_XPATH_LABEL,
                "position": "string",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "en_US",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "name",
                "term": EN_NAME_PLACEHOLDER,
                "position": "placeholder",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "fr_FR",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "name",
                "term": FR_NAME_PLACEHOLDER,
                "position": "placeholder",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "en_US",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "lang",
                "term": EN_LANG_LABEL,
                "position": "string",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "fr_FR",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "lang",
                "term": FR_LANG_LABEL,
                "position": "string",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "en_US",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "type",
                "term": EN_SELECTION_LABEL,
                "position": "selection",
                "key": "contact",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "fr_FR",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "type",
                "term": FR_SELECTION_LABEL,
                "position": "selection",
                "key": "contact",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "en_US",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "user_id",
                "term": EN_HELP_LABEL,
                "position": "help",
            }
        )

        cls.env["web.custom.label"].create(
            {
                "lang": "fr_FR",
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "user_id",
                "term": FR_HELP_LABEL,
                "position": "help",
            }
        )

        cls.env = cls.env(user=cls.env.ref("base.user_demo"))
        cls.env.user.lang = "en_US"

    def _get_rendered_view_tree(self, lang):
        arch = (
            self.env["res.partner"]
            .with_context(lang=lang)
            .fields_view_get(view_id=self.view.id)
        )["arch"]
        return etree.fromstring(arch)

    @data(
        (None, EN_NAME_LABEL),
        ("en_US", EN_NAME_LABEL),
        ("fr_FR", FR_NAME_LABEL),
    )
    @unpack
    def test_field_node_string(self, lang, label):
        tree = self._get_rendered_view_tree(lang=lang)
        el = tree.xpath("//field[@name='name']")[0]
        assert el.attrib.get("string") == label

    @data(
        (None, EN_XPATH_LABEL),
        ("en_US", EN_XPATH_LABEL),
        ("fr_FR", FR_XPATH_LABEL),
    )
    @unpack
    def test_field_node_string_with_xpath(self, lang, label):
        tree = self._get_rendered_view_tree(lang=lang)
        el = tree.xpath(self.xpath)[0]
        assert el.attrib.get("string") == label

    @data(
        (None, EN_LANG_LABEL),
        ("en_US", EN_LANG_LABEL),
        ("fr_FR", FR_LANG_LABEL),
    )
    @unpack
    def test_label_node_string(self, lang, label):
        """If any label node related to the field, it is overriden by the custom label.

        For example, if we have:

        <label for="street" string="Address">
        <div>
            <div class="o_address_format" name="div_address">
                <field name="street" ...
            </div>
        </div>

        A custom label referencing the field street should be applied on the label node as well.
        """
        tree = self._get_rendered_view_tree(lang=lang)
        el = tree.xpath("//label[@for='lang']")[0]
        assert el.attrib.get("string") == label

    @data(
        (None, EN_NAME_PLACEHOLDER),
        ("en_US", EN_NAME_PLACEHOLDER),
        ("fr_FR", FR_NAME_PLACEHOLDER),
    )
    @unpack
    def test_placeholder(self, lang, label):
        tree = self._get_rendered_view_tree(lang=lang)
        el = tree.xpath("//field[@name='name']")[0]
        assert el.attrib.get("placeholder") == label

    @data(
        (None, EN_NAME_LABEL),
        ("en_US", EN_NAME_LABEL),
        ("fr_FR", FR_NAME_LABEL),
    )
    @unpack
    def test_label_is_updated_in_fields_view_get(self, lang, label):
        fields = (
            self.env["res.partner"]
            .with_context(lang=lang)
            .fields_view_get(view_id=self.view.id)
        )["fields"]
        assert fields["name"]["string"] == label

    @data(
        (None, EN_NAME_LABEL),
        ("en_US", EN_NAME_LABEL),
        ("fr_FR", FR_NAME_LABEL),
    )
    @unpack
    def test_label_is_updated_in_fields_get(self, lang, label):
        fields = self.env["res.partner"].with_context(lang=lang).fields_get()
        assert fields["name"]["string"] == label

    @data(
        (None, EN_SELECTION_LABEL),
        ("en_US", EN_SELECTION_LABEL),
        ("fr_FR", FR_SELECTION_LABEL),
    )
    @unpack
    def test_selection_label_is_updated_in_fields_view_get(self, lang, label):
        fields = (
            self.env["res.partner"]
            .with_context(lang=lang)
            .fields_view_get(view_id=self.view.id)
        )["fields"]
        options = {i[0]: i[1] for i in fields["type"]["selection"]}
        assert options["contact"] == label

    @data(
        (None, EN_SELECTION_LABEL),
        ("en_US", EN_SELECTION_LABEL),
        ("fr_FR", FR_SELECTION_LABEL),
    )
    @unpack
    def test_selection_label_is_updated_in_fields_get(self, lang, label):
        fields = self.env["res.partner"].with_context(lang=lang).fields_get()
        options = {i[0]: i[1] for i in fields["type"]["selection"]}
        assert options["contact"] == label

    @data(
        (None, EN_HELP_LABEL),
        ("en_US", EN_HELP_LABEL),
        ("fr_FR", FR_HELP_LABEL),
    )
    @unpack
    def test_field_help(self, lang, label):
        tree = self._get_rendered_view_tree(lang=lang)
        el = tree.xpath("//field[@name='user_id']")[0]
        assert el.attrib.get("help") == label

    @data(
        (None, EN_HELP_LABEL),
        ("en_US", EN_HELP_LABEL),
        ("fr_FR", FR_HELP_LABEL),
    )
    @unpack
    def test_field_help__fields_get(self, lang, label):
        fields = self.env["res.partner"].with_context(lang=lang).fields_get()
        assert fields["user_id"]["help"] == label

    @data(
        (None, EN_HELP_LABEL),
        ("en_US", EN_HELP_LABEL),
        ("fr_FR", FR_HELP_LABEL),
    )
    @unpack
    def test_field_help__fields_view_get(self, lang, label):
        fields = (
            self.env["res.partner"]
            .with_context(lang=lang)
            .fields_view_get(view_id=self.view.id)
        )["fields"]
        assert fields["user_id"]["help"] == label
