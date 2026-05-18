# Copyright 2025 Simone Rubino - PyTech
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo_test_helper import FakeModelLoader

from odoo import tests, tools
from odoo.modules.module import get_resource_path


@tests.tagged("post_install", "-at_install")
class TestDomainField(tests.HttpSavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.loader = FakeModelLoader(cls.env, cls.__module__)
        cls.loader.backup_registry()

        from .models import FakeModel

        cls.loader.update_registry((FakeModel,))
        tools.convert_file(
            cls.env.cr,
            "web_domain_field",
            get_resource_path("web_domain_field", "tests", "fake_model_views.xml"),
            {},
            kind="test",
        )
        tools.convert_file(
            cls.env.cr,
            "web_domain_field",
            get_resource_path("web_domain_field", "tests", "ir.model.access.csv"),
            {},
            kind="test",
        )

    @classmethod
    def tearDownClass(cls):
        cls.loader.restore_registry()
        super().tearDownClass()

    def test_false_domain(self):
        self.start_tour("/web", "web_domain_field.false_domain_tour", login="admin")
