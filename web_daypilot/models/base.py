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

from collections import defaultdict
from datetime import datetime, timedelta

import pytz

from odoo import api, fields, models
from odoo.orm.domains import Domain
from odoo.tools import unique


class Base(models.AbstractModel):
    _inherit = "base"

    daypilot_tooltip = fields.Char(
        compute="_compute_daypilot_tooltip",
    )

    def _compute_daypilot_tooltip(self):
        """Content shown as the DayPilot event tooltip.

        Empty by default; modules can override this method (with their
        own @api.depends) to provide record-specific tooltip content
        (e.g. customer name and phone).
        """
        for record in self:
            record.daypilot_tooltip = False

    @api.model
    def get_daypilot_data(
        self,
        domain,
        groupby,
        read_specification,
        start_date=None,
        stop_date=None,
        unavailability_fields=None,
        business_hours_start=None,
        business_hours_end=None,
        date_start_field=None,
        date_stop_field=None,
    ):
        """
        Returns the result of a read_group with group expansion for DayPilot view.
        This ensures all possible resources are shown as columns, even if they have
        no events in the current date range.

        :param domain: search domain
        :param groupby: list of field to group on (single field for DayPilot)
        :param read_specification: web_read spec to read records within groups
        :param string start_date: start datetime in utc (optional, for unavailability)
        :param string stop_date: stop datetime in utc (optional, for unavailability)
        :param list unavailability_fields: list of fields to fetch unavailability for
        :param int business_hours_start: start hour for business hours (0-23, default 8)
        :param int business_hours_end: end hour for business hours (0-23, default 18)
        :param string date_start_field: field name for the start date (e.g. 'start')
        :param string date_stop_field: field name for the stop date (e.g. 'stop')
        :return:
            {
                'records': [<record data>],
                'resources': [{'id': '1', 'name': 'Resource Name'}, ...],
                'unavailabilities': {
                    '<field>': {<res_id>: [{'start': ..., 'stop': ...}], ...}
                }
            }
        """
        # Save original domain for group expansion (all resource columns)
        expand_domain = domain
        # Build the date-filtered domain for fetching records within range
        domain = self._modify_domain_for_daypilot(
            domain, start_date, stop_date, date_start_field, date_stop_field
        )
        groups, all_records = self._fetch_groups_and_records(
            domain, expand_domain, groupby, read_specification
        )
        records = all_records.with_env(self.env).web_read(read_specification)
        resources = (
            self._extract_resources_from_groups(groups, groupby) if groupby else []
        )
        unavailabilities = self._fetch_unavailabilities(
            groups,
            unavailability_fields,
            start_date,
            stop_date,
            business_hours_start,
            business_hours_end,
        )
        return {
            "records": records,
            "resources": resources,
            "unavailabilities": unavailabilities,
        }

    def _fetch_groups_and_records(
        self, domain, expand_domain, groupby, read_specification
    ):
        """Fetch groups and records, handling both grouped and non-grouped cases.

        :param domain: date-filtered domain — used to fetch only the records
            that fall within the visible range.
        :param expand_domain: original (unfiltered) domain — used for group
            expansion so that all resource columns are shown, even those with
            no records in the current date range.
        :param groupby: list of fields to group on (single field for DayPilot).
        :param read_specification: web_read spec to read records.
        """
        if groupby:
            # Use the original (unfiltered) domain for group expansion so that
            # all resource columns appear, even those without records in range.
            groups, _ = self.with_context(
                read_group_expand=True
            )._formatted_read_group_with_length(
                expand_domain, groupby, ["id:array_agg"]
            )

            all_record_ids = tuple(
                unique(
                    record_id
                    for one_group in groups
                    for record_id in one_group["id:array_agg"]
                )
            )
            # Fetch only the records within the date range from the expanded
            # groups, using the filtered domain restricted to those IDs.
            all_records = self.with_context(active_test=False).search_fetch(
                Domain.AND([domain, [("id", "in", all_record_ids)]]),
                read_specification.keys(),
            )
        else:
            groups = []
            all_records = self.search_fetch(domain, read_specification.keys())
        return groups, all_records

    def _modify_domain_for_daypilot(
        self, domain, start_date, stop_date, date_start_field, date_stop_field
    ):
        """Modify domain to add DayPilot date range filter.

        Combines as: orig_domain AND day-filter.
        Resource column expansion is handled separately in
        ``_fetch_groups_and_records`` by using the unfiltered domain for
        ``read_group`` and the filtered domain only for record fetching.

        :param domain: original search domain
        :param start_date: start datetime for DayPilot view
        :param stop_date: stop datetime for DayPilot view
        :param date_start_field: field name for the start date (e.g. 'start')
        :param date_stop_field: field name for the stop date (e.g. 'stop')
        :return: modified domain
        """
        if not start_date or not stop_date:
            return domain

        if not date_start_field or not date_stop_field:
            return domain

        day_conditions = [
            (date_start_field, "<=", stop_date),
            (date_stop_field, ">=", start_date),
        ]

        return list(Domain.AND([domain, day_conditions]))

    def _extract_resources_from_groups(self, groups, groupby):
        """Extract resources from groups in DayPilot-ready format.

        If context specifies daypilot_resource_ids, ensure those resources
        are included even if they have no records in the current groups.
        """

        def _parse_resource(resource_id):
            """Parse resource ID from many2one tuple or scalar value."""
            if isinstance(resource_id, (list, tuple)):
                return resource_id[0], resource_id[1]
            return resource_id, str(resource_id)

        resource_map = {}
        # Extract resources from groups
        for group in groups:
            resource_id = group.get(groupby[0])
            if resource_id:
                res_id, res_name = _parse_resource(resource_id)
                if res_id not in resource_map:
                    resource_map[res_id] = {"id": str(res_id), "name": res_name}

        # Add additional resources from context if specified
        additional_resource_ids = self.env.context.get("daypilot_resource_ids")
        if additional_resource_ids:
            comodel_name = self._fields[groupby[0]].comodel_name
            additional_resources = self.env[comodel_name].browse(
                additional_resource_ids
            )
            for resource in additional_resources:
                if resource.id not in resource_map:
                    resource_map[resource.id] = {
                        "id": str(resource.id),
                        "name": resource.name,
                    }

        return list(resource_map.values())

    def _fetch_unavailabilities(
        self,
        groups,
        unavailability_fields,
        start_date,
        stop_date,
        business_hours_start,
        business_hours_end,
    ):
        """Fetch unavailability data for resources."""
        if not unavailability_fields or not start_date or not stop_date:
            return {}

        res_ids_for_unavailabilities = defaultdict(set)
        for group in groups:
            for field in unavailability_fields:
                res_id = group[field][0] if group[field] else False
                if res_id:
                    res_ids_for_unavailabilities[field].add(res_id)

        # Ensure unavailability is also computed for resources explicitly added
        # via context (e.g. daypilot_resource_ids) even when they have no records
        # in the current view. Only add IDs to fields that point at the same
        # relation model (res.users in this case) to avoid passing user IDs to
        # unrelated unavailability lookups.
        additional_resource_ids = self.env.context.get("daypilot_resource_ids") or []
        if additional_resource_ids:
            for field in unavailability_fields:
                if self._fields[field].comodel_name == "res.users":
                    res_ids_for_unavailabilities[field].update(additional_resource_ids)

        start = (
            fields.Datetime.from_string(start_date)
            if isinstance(start_date, str)
            else start_date
        )
        stop = (
            fields.Datetime.from_string(stop_date)
            if isinstance(stop_date, str)
            else stop_date
        )

        unavailabilities = {}
        for field in unavailability_fields:
            unavailabilities[field] = self._daypilot_unavailability(
                field,
                list(res_ids_for_unavailabilities[field]),
                start,
                stop,
                business_hours_start=business_hours_start,
                business_hours_end=business_hours_end,
            )
        return unavailabilities

    @api.model
    def _daypilot_unavailability(
        self,
        field,
        res_ids,
        start,
        stop,
        business_hours_start=None,
        business_hours_end=None,
    ):
        """
        Get unavailability data for a given set of resources.
        This method is meant to be overridden by models that want to
        implement unavailability on DayPilot views.

        The default implementation uses business hours to mark non-business
        hours as unavailable. Hours outside the business_hours_start to
        business_hours_end range are considered unavailable.

        Example::

            >>> _daypilot_unavailability(
            ...    field="user_id",
            ...    res_ids=[3, 9],
            ...    start=datetime(2024, 1, 1, 8, 0),
            ...    stop=datetime(2024, 1, 7, 18, 0),
            ...    business_hours_start=9,
            ...    business_hours_end=17,
            ... )
            {
                3: [
                    {'start': '2024-01-01 00:00:00', 'stop': '2024-01-01 09:00:00'},
                    {'start': '2024-01-01 17:00:00', 'stop': '2024-01-02 09:00:00'},
                    {'start': '2024-01-02 17:00:00', 'stop': '2024-01-03 09:00:00'},
                    ...
                ],
                9: [...]
            }

        For example, with business hours 9-17, all hours before 9am and after 5pm
        are marked as unavailable for each day in the range.

        Note that resources with no unavailabilities should still be present
        in the returned dict with an empty list.

        :param string field: name of a many2X field (e.g., 'user_id', 'employee_id')
        :param list res_ids: list of resource ids for which we want unavailabilities
        :param datetime start: start datetime
        :param datetime stop: stop datetime
        :param int business_hours_start: start hour for business hours (0-23, default 8)
        :param int business_hours_end: end hour for business hours (0-23, default 18)
        :returns: dict of unavailabilities per resource id
        """
        if business_hours_start is None:
            business_hours_start = 8
        if business_hours_end is None:
            business_hours_end = 18

        # The intervals are identical for every resource; compute them once.
        intervals = []
        current = start.replace(hour=0, minute=0, second=0, microsecond=0)
        while current < stop:
            # Non-business hours before business start
            day_start = current.replace(
                hour=business_hours_start, minute=0, second=0, microsecond=0
            )
            if current < day_start:
                intervals.append(
                    {
                        "start": fields.Datetime.to_string(current),
                        "stop": fields.Datetime.to_string(day_start),
                    }
                )

            # Non-business hours after business end
            day_end = current.replace(
                hour=business_hours_end, minute=0, second=0, microsecond=0
            )
            next_day = (current + timedelta(days=1)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            intervals.append(
                {
                    "start": fields.Datetime.to_string(day_end),
                    "stop": fields.Datetime.to_string(next_day),
                }
            )
            current = next_day

        return {res_id: intervals for res_id in res_ids}

    @api.model
    def get_daypilot_default_time(
        self, business_hours_start=None, business_hours_end=None
    ):
        """Calculate default time for Daypilot new event creation.

        This method can be extended in custom modules to implement custom
        default time logic based on business hours, current time, or other factors.

        :param business_hours_start: Business hours start (e.g., 9 for 9:00 AM)
        :param business_hours_end: Business hours end (e.g., 17 for 5:00 PM)
        :return: dict with 'start' and 'stop' in UTC format (YYYY-MM-DD HH:MM:SS)
        """
        tz_name = self.env.context.get("tz") or "UTC"
        tz = pytz.timezone(tz_name)
        now = datetime.now(tz)

        # Use current time as default
        start = now
        stop = now + timedelta(hours=1)  # Default 1 hour duration

        # If business hours provided and current time is outside business hours,
        # snap to next business hour
        if business_hours_start is not None and business_hours_end is not None:
            current_hour = now.hour + now.minute / 60.0
            if current_hour < business_hours_start:
                # Before business hours - snap to business hours start
                start = now.replace(
                    hour=int(business_hours_start), minute=0, second=0, microsecond=0
                )
                stop = start + timedelta(hours=1)
            elif current_hour >= business_hours_end:
                # After business hours - snap to next day business hours start
                tomorrow = now + timedelta(days=1)
                start = tomorrow.replace(
                    hour=int(business_hours_start), minute=0, second=0, microsecond=0
                )
                stop = start + timedelta(hours=1)

        # Convert to UTC before returning
        start_utc = start.astimezone(pytz.utc).replace(tzinfo=None)
        stop_utc = stop.astimezone(pytz.utc).replace(tzinfo=None)

        return {
            "start": start_utc.strftime("%Y-%m-%d %H:%M:%S"),
            "stop": stop_utc.strftime("%Y-%m-%d %H:%M:%S"),
        }
