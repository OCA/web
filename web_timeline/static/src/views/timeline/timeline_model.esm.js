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
        let fields = this.params.fieldNames;
        fields = [...new Set(fields.concat(this.last_group_bys))];
        // Avoid ordering by many2many fields
        // because it is not supported by Odoo
        // In the module sale_timesheet_timeline, it is used
        // with default_group_by = task_user_ids
        let field_to_order = this.params.default_group_by;
        if (this.fields[field_to_order].type === "many2many") {
            field_to_order = undefined;
        }
        this.data = await this.keepLast.add(
            this.orm.call(this.model_name, "search_read", [], {
                fields: fields,
                domain: searchParams.domain,
                order: field_to_order,
                context: searchParams.context,
            })
        );
        this.notify();
    }
    /**
     * Transform Odoo event object to timeline event object.
     *
     * @param {Object} record
     * @private
     * @returns {Object}
     */
    _event_data_transform(record) {
        const [date_start, date_stop] = this._get_event_dates(record);
        let group = record[this.last_group_bys[0]];
        if (group && Array.isArray(group) && group.length > 0) {
            group = group[0];
        } else {
            group = -1;
        }
        let colorToApply = false;
        for (const color of this.colors) {
            if (evaluate(color.ast, record)) {
                colorToApply = color.color;
            }
        }

        let content = record.display_name;
        if (this.recordTemplate) {
            content = this._render_timeline_item(record);
        }

        const timeline_item = {
            start: date_start.toJSDate(),
            content: content,
            id: record.id,
            order: record.order,
            group: group,
            evt: record,
            style: `background-color: ${colorToApply};`,
        };
        // Only specify range end when there actually is one.
        // ➔ Instantaneous events / those with inverted dates are displayed as points.
        if (date_stop && DateTime.fromISO(date_start) < DateTime.fromISO(date_stop)) {
            timeline_item.end = date_stop.toJSDate();
        }
        return timeline_item;
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
        return this._event_data_transform(records[0]);
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
