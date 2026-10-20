from odoo_test_helper import FakeModelLoader

from odoo import fields, models


class BusRecordEventFake(models.Model):
    _name = "bus.record.event.fake"
    _description = "Fake Model for Bus Events"
    _inherit = ["bus.record.event.mixin"]

    name = fields.Char()
    user_id = fields.Many2one("res.users", string="User")


class TestBusRecordEventsCase:
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.loader = FakeModelLoader(cls.env, cls.__module__)
        cls.loader.backup_registry()
        cls.loader.update_registry([BusRecordEventFake])

    @classmethod
    def tearDownClass(cls):
        cls.loader.restore_registry()
        super().tearDownClass()
