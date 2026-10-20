from odoo.tests import HttpCase, tagged


@tagged("-at_install", "post_install")
class TestBusRecordEventsJS(HttpCase):
    def test_js_unit(self):
        self.browser_js(
            "/web/tests/?debug=assets&filter=bus_record_events",
            "",
            "",
            login="admin",
            timeout=1800,
        )
