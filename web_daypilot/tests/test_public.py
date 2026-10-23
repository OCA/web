# Part of Barberhood. See LICENSE file for full copyright and licensing details.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from datetime import datetime, timedelta

import pytz

from odoo.tests import TransactionCase, tagged


@tagged("brb_public", "post_install", "-at_install")
class TestWebDayPilotPublic(TransactionCase):
    def test_daypilot_resource_ids_only_match_res_users_fields(self):
        """daypilot_resource_ids (res.users IDs) must not be injected into
        unavailability fields that point at a different relation model.
        """
        public_user = self.env.ref("base.public_user")
        partner = public_user.partner_id

        day_start = datetime(2026, 9, 2, tzinfo=pytz.utc)
        day_end = day_start + timedelta(hours=24)

        # Simulate a DayPilot call that passes extra res.users IDs via context.
        # The unavailability field here is res.partner, so the extra user IDs
        # should be ignored by _fetch_unavailabilities.
        unavailabilities = (
            self.env["res.users"]
            .with_context(daypilot_resource_ids=[public_user.id])
            ._fetch_unavailabilities(
                groups=[{"partner_id": (partner.id, partner.name)}],
                unavailability_fields=["partner_id"],
                start_date=day_start,
                stop_date=day_end,
                business_hours_start=9,
                business_hours_end=17,
            )
        )

        self.assertIn("partner_id", unavailabilities)
        self.assertIn(
            partner.id,
            unavailabilities["partner_id"],
            "The group partner should have unavailability data",
        )
        self.assertNotIn(
            public_user.id,
            unavailabilities["partner_id"],
            "daypilot_resource_ids should not be added to a res.partner "
            "unavailability field",
        )
