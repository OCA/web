/** @odoo-module **/
/**
 * Copyright 2024 Tecnativa - Carlos López
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */
import {serializeDate, serializeDateTime} from "@web/core/l10n/dates";
import {KanbanCompiler} from "@web/views/kanban/kanban_compiler";
import {KeepLast} from "@web/core/utils/concurrency";
import {Model} from "@web/model/model";
import {evaluate} from "@web/core/py_js/py";
import {onWillStart} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {renderToString} from "@web/core/utils/render";
import {useViewCompiler} from "@web/views/view_compiler";

const {DateTime} = luxon;
const parsers = registry.category("parsers");
const formatters = registry.category("formatters");

export class TimelineModel extends Model {
    setup(params) {
        this.params = params;
        this.model_name = params.resModel;
        this.fields = this.params.fields;
        this.date_start = this.params.date_start;
        this.date_stop = this.params.date_stop;
        this.date_delay = this.params.date_delay;
        this.colors = this.params.colors;
        this.last_group_bys = this.params.default_group_by.split(",");
        const templates = useViewCompiler(KanbanCompiler, this.params.templateDocs);
        this.recordTemplate = templates["timeline-item"];

        this.keepLast = new KeepLast();
        onWillStart(async () => {
            this.write_right = await this.orm.call(
                this.model_name,
                "check_access_rights",
                ["write", false]
            );
            this.unlink_right = await this.orm.call(
                this.model_name,
                "check_access_rights",
                ["unlink", false]
            );
            this.create_right = await this.orm.call(
                this.model_name,
                "check_access_rights",
                ["create", false]
            );
        });
    }
    /**
     * Read the records for the timeline.
     * @param {Object} searchParams
     */
    async load(searchParams) {
        if (searchParams.groupBy && searchParams.groupBy.length) {
            this.last_group_bys = searchParams.groupBy;
        } else {
            this.last_group_bys = this.params.default_group_by.split(",");
        }
        // For fields to read, use base field names (strip :operator specifiers)
        const base_group_by_names = this.last_group_bys.map((spec) =>
            spec.includes(":") ? spec.split(":")[0] : spec
        );
        let fields = this.params.fieldNames;
        fields = [...new Set(fields.concat(base_group_by_names))];
        // Identify date group-by specifiers that need transformation
        const group_bys_date_fields = this.last_group_bys.filter(
            (spec) =>
                spec.includes(":") &&
                (spec.includes(":year") ||
                    spec.includes(":quarter") ||
                    spec.includes(":month") ||
                    spec.includes(":week") ||
                    spec.includes(":day"))
        );
        // For order, use base field names
        const order = this.params.default_group_by
            .split(",")
            .map((g) => (g.includes(":") ? g.split(":")[0] : g).trim())
            .join(",");
        this.data = await this.keepLast.add(
            this.orm.call(this.model_name, "search_read", [], {
                fields: fields,
                domain: searchParams.domain,
                order: order,
                context: searchParams.context,
            })
        );
        // Transform date fields for grouping
        for (const d of this.data) {
            for (const date_group of group_bys_date_fields) {
                const base_field = date_group.split(":")[0];
                const date_value = d[base_field];
                if (date_value) {
                    d[date_group] = this._getGroupedDate(date_group, date_value);
                }
            }
        }
        this.notify();
    }
    /**
     * Transform Odoo event object to timeline event object.
     *
     * @param {Object} record
     * @private
     * @returns {Object|Array} Single timeline item or array of items for m2m groups
     */
    /* eslint-disable complexity */
    _event_data_transform(record) {
        const [date_start, date_stop] = this._get_event_dates(record);
        let currentPaths = [[]];

        for (const grouped_field_spec of this.last_group_bys) {
            const fieldValue = record[grouped_field_spec];
            const base_grouped_field = grouped_field_spec.includes(":")
                ? grouped_field_spec.split(":")[0]
                : grouped_field_spec;
            const fieldInfo = this.fields[base_grouped_field];
            const fieldSegments = [];

            if (fieldInfo.type === "many2many") {
                const m2mIds = Array.isArray(fieldValue)
                    ? fieldValue.filter((id) => id !== false && id !== null)
                    : [];
                if (m2mIds.length === 0) {
                    fieldSegments.push({
                        field: base_grouped_field,
                        value: false,
                        spec: grouped_field_spec,
                    });
                } else {
                    m2mIds.forEach((valId) => {
                        fieldSegments.push({
                            field: base_grouped_field,
                            value: valId,
                            spec: grouped_field_spec,
                        });
                    });
                }
            } else if (
                grouped_field_spec.includes(":") &&
                (fieldInfo.type === "date" || fieldInfo.type === "datetime")
            ) {
                fieldSegments.push({
                    field: base_grouped_field,
                    value: fieldValue,
                    spec: grouped_field_spec,
                });
            } else if (Array.isArray(fieldValue)) {
                fieldSegments.push({
                    field: base_grouped_field,
                    value: fieldValue[0],
                    spec: grouped_field_spec,
                });
            } else if (
                fieldValue !== undefined &&
                fieldValue !== null &&
                fieldValue !== ""
            ) {
                if (fieldValue === false && typeof fieldValue === "boolean") {
                    fieldSegments.push({
                        field: base_grouped_field,
                        value: false,
                        spec: grouped_field_spec,
                    });
                } else {
                    fieldSegments.push({
                        field: base_grouped_field,
                        value: fieldValue,
                        spec: grouped_field_spec,
                    });
                }
            } else {
                fieldSegments.push({
                    field: base_grouped_field,
                    value: false,
                    spec: grouped_field_spec,
                });
            }
            currentPaths = currentPaths.flatMap((path) =>
                fieldSegments.map((segment) => [...path, segment])
            );
        }

        const groupJSONStrings = currentPaths.map((path) => JSON.stringify(path));

        let colorToApply = false;
        for (const color of this.colors) {
            try {
                if (evaluate(color.ast, record)) {
                    colorToApply = color.color;
                }
            } catch (e) {
                console.warn("Error evaluating color expression:", e);
            }
        }

        let content = record.display_name;
        if (this.recordTemplate) {
            content = this._render_timeline_item(record);
        }

        const r_list = [];
        for (const jsonPathString of groupJSONStrings) {
            const r = {
                start: date_start.toJSDate(),
                content: content,
                // Unique ID for vis.js item
                id: record.id + "_" + jsonPathString,
                record_id: record.id,
                order: record.order,
                // The group this specific vis.js item belongs to
                group: jsonPathString,
                evt: record,
                style: colorToApply ? `background-color: ${colorToApply};` : "",
            };
            if (
                date_stop &&
                DateTime.fromISO(date_start) < DateTime.fromISO(date_stop)
            ) {
                r.end = date_stop.toJSDate();
            }
            r_list.push(r);
        }
        // Reset color for next event
        return r_list.length === 1 ? r_list[0] : r_list;
    }
    /**
     * Get dates from given event
     *
     * @param {Object} record
     * @returns {Object}
     */
    _get_event_dates(record) {
        let date_start = DateTime.now();
        let date_stop = null;
        const date_delay = record[this.date_delay] || false;
        date_start = this.parseDate(
            this.fields[this.date_start],
            record[this.date_start]
        );
        if (this.date_stop && record[this.date_stop]) {
            date_stop = this.parseDate(
                this.fields[this.date_stop],
                record[this.date_stop]
            );
        }
        if (!date_stop && date_delay) {
            date_stop = date_start.plus({hours: date_delay});
        }

        return [date_start, date_stop];
    }
    /**
     * Parse Date or DateTime field
     *
     * @param {Object} field
     * @param {Object} value
     * @returns {DateTime} new_date in UTC timezone if field is datetime
     */
    parseDate(field, value) {
        let new_date = parsers.get(field.type)(value);
        if (field.type === "datetime") {
            new_date = new_date.setZone("UTC", {keepLocalTime: true});
        }
        return new_date;
    }

    /**
     * Serializes a date or datetime value based on the field type.
     * to send it to the server.
     * @param {String} field_name - The field name.
     * @param {DateTime} value - The value to be serialized, either a date or datetime.
     * @returns {String} - The serialized date or datetime string.
     */
    serializeDate(field_name, value) {
        const field = this.fields[field_name];
        return field.type === "date" ? serializeDate(value) : serializeDateTime(value);
    }

    /**
     * Get the grouped date value for a given date, based on the group type.
     * @param {String} date_group The date group specifier (e.g., 'date_start:month').
     * @param {String} date_value The date value to be grouped.
     * @returns {String|Number} The grouped date value.
     */
    _getGroupedDate(date_group, date_value) {
        const field = this.fields[date_group.split(":")[0]];
        const dt = this.parseDate(field, date_value);
        const group_type = date_group.split(":")[1];
        if (group_type === "year") {
            return dt.year;
        } else if (group_type === "quarter") {
            return `Q${dt.quarter} ${dt.year}`;
        } else if (group_type === "month") {
            return dt.toFormat("MMMM yyyy");
        } else if (group_type === "week") {
            return `W${dt.weekNumber} ${dt.year}`;
        } else if (group_type === "day") {
            return dt.toFormat("dd MMM yyyy");
        }
        return date_value;
    }

    /**
     * Render timeline item template.
     *
     * @param {Object} record Record
     * @private
     * @returns {String} Rendered template
     */
    _render_timeline_item(record) {
        return renderToString(this.recordTemplate, {
            record: record,
            formatters,
            parsers,
        });
    }
    /**
     * Triggered upon confirm of removing a record.
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    async remove_completed(event) {
        await this.orm.call(this.model_name, "unlink", [[event.evt.id]]);
        const unlink_index = this.data.findIndex((item) => item.id === event.evt.id);
        if (unlink_index !== -1) {
            this.data.splice(unlink_index, 1);
        }
    }
    /**
     * Triggered upon completion of a new record.
     * Updates the timeline view with the new record.
     *
     * @param {RecordId} id
     * @returns {jQuery.Deferred}
     */
    async create_completed(id) {
        const records = await this.orm.call(this.model_name, "read", [
            [id],
            this.params.fieldNames,
        ]);
        const record = records[0];
        // Transform date fields for grouping (same as in load)
        for (const spec of this.last_group_bys) {
            if (spec.includes(":")) {
                const base_field = spec.split(":")[0];
                const date_value = record[base_field];
                if (date_value) {
                    record[spec] = this._getGroupedDate(spec, date_value);
                }
            }
        }
        return this._event_data_transform(record);
    }
    /**
     * Triggered upon completion of writing a record.
     * @param {Integer} id
     * @param {Object} vals
     */
    async write_completed(id, vals) {
        return this.orm.call(this.model_name, "write", [id, vals]);
    }
    get canCreate() {
        return this.params.canCreate && this.create_right;
    }
    get canDelete() {
        return this.params.canDelete && this.unlink_right;
    }
    get canEdit() {
        return this.params.canUpdate && this.write_right;
    }
}
