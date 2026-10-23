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

from lxml import etree

from odoo import fields, models

DAYPILOT_VALID_ATTRIBUTES = {
    "__validate__",  # ir.ui.view implementation detail
    "date_start",
    "date_stop",
    "default_scale",  # Default DayPilot scale
    # (CellDuration, Minute, Hour, Day, Week)
    "default_range",  # Navigation period (day, week, month)
    "class",
    "js_class",
    "form_view_id",
    "create",
    "edit",
    "delete",
    "resource",  # Default field for resource column grouping
    "default_group_by",
    "string",
    "sample",
    "time_slot_duration",  # Duration of time slots in minutes
    "event_template",
    "tooltip",
    "business_hours_start",  # Business hours start (0-23)
    "business_hours_end",  # Business hours end (0-23)
    "business_hours_only",  # Hide non-business hours
    "show_current_time",  # Whether to show current time indicator
}


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[("daypilot", "DayPilot")])

    def _validate_tag_daypilot(self, node, name_manager, node_info):
        if not node_info["validate"]:
            return

        for child in node.iterchildren(tag=etree.Element):
            if child.tag != "field":
                msg = self.env._("DayPilot child can only be field, got %s", child.tag)
                self._raise_view_error(msg, child)

        default_scale = node.get("default_scale")
        if default_scale:
            valid_scales = ("cellduration", "minute", "hour", "day", "week")
            if default_scale.lower() not in valid_scales:
                self._raise_view_error(
                    self.env._(
                        "Invalid default_scale '%s' in daypilot",
                        default_scale,
                    ),
                    node,
                )

        default_range = node.get("default_range")
        if default_range:
            if default_range not in ("day", "week", "month"):
                self._raise_view_error(
                    self.env._(
                        "Invalid default_range '%s' in daypilot",
                        default_range,
                    ),
                    node,
                )

        self._validate_daypilot_int_attributes(node)

        attrs = set(node.attrib)
        if "date_start" not in attrs:
            msg = self.env._("DayPilot must have a 'date_start' attribute")
            self._raise_view_error(msg, node)

        if "date_stop" not in attrs:
            msg = self.env._("DayPilot must have a 'date_stop' attribute")
            self._raise_view_error(msg, node)

        remaining = attrs - DAYPILOT_VALID_ATTRIBUTES
        if remaining:
            msg = self.env._(
                "Invalid attributes (%(invalid_attributes)s) in daypilot view. "
                "Attributes must be in (%(valid_attributes)s)",
                invalid_attributes=remaining,
                valid_attributes=DAYPILOT_VALID_ATTRIBUTES,
            )
            self._raise_view_error(msg, node)

    def _validate_daypilot_int_attributes(self, node):
        int_attributes = {
            "time_slot_duration": (1, 1440),  # Max 24 hours in minutes
            "business_hours_start": (0, 23),
            "business_hours_end": (0, 23),
        }
        for attr_name, (min_value, max_value) in int_attributes.items():
            raw_value = node.get(attr_name)
            if not raw_value:
                continue
            try:
                value = int(raw_value)
            except ValueError:
                self._raise_view_error(
                    self.env._(
                        "%(attr)s must be an integer in daypilot",
                        attr=attr_name,
                    ),
                    node,
                )
                continue
            if value < min_value or value > max_value:
                self._raise_view_error(
                    self.env._(
                        "Invalid %(attr)s '%(value)s' in daypilot",
                        attr=attr_name,
                        value=raw_value,
                    ),
                    node,
                )

    def _get_view_fields(self, view_type, models):
        if view_type == "daypilot":
            models[self._name] = list(self._fields.keys())
            return models
        return super()._get_view_fields(view_type, models)

    def _get_view_info(self):
        return {"daypilot": {"icon": "fa fa-clock-o"}} | super()._get_view_info()

    def _is_qweb_based_view(self, view_type):
        return view_type == "daypilot" or super()._is_qweb_based_view(view_type)
