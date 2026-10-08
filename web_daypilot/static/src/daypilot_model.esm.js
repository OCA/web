/**
 * DayPilot Model
 *
 * This model follows the same pattern as CalendarModel from web.calendar:
 * - https://github.com/odoo/odoo/blob/19.0/addons/web/static/src/views/calendar/calendar_model.js
 *
 * Reactivity Pattern:
 * 1. load() method fetches data from the server based on search parameters
 * 2. After data is loaded, this.notify() is called to signal data change
 * 3. This triggers the renderer's onPatched hook
 * 4. The renderer updates the library instance with new data
 *
 * This ensures the calendar updates automatically when search parameters
 * change (groupby, filters, etc.), similar to Kanban and Gantt views.
 */

import {
    deserializeDate,
    deserializeDateTime,
    serializeDateTime,
} from "@web/core/l10n/dates";
import {Model} from "@web/model/model";
import {Mutex} from "@web/core/utils/concurrency";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";

/**
 * @typedef {luxon.DateTime} DateTime
 *
 * @typedef MetaData
 * @property {String} dateStartField
 * @property {String} dateStopField
 * @property {string[]} fieldNames
 * @property {String} scale
 * @property {String} defaultRange
 * @property {Number} timeSlotDuration
 * @property {Number} businessHoursStart
 * @property {Number} businessHoursEnd
 * @property {Boolean} businessHoursOnly
 * @property {DateTime} startDate
 * @property {DateTime} stopDate
 * @property {Object} fields
 * @property {String} resModel
 */

export class DayPilotModel extends Model {
    static services = ["notification", "orm"];

    setup(params, services) {
        this.notification = services.notification;
        this.orm = services.orm;

        /** @type {Object} */
        this.data = {};
        /** @type {MetaData} */
        this.metaData = params.metaData;

        this.searchParams = null;

        this.mutex = new Mutex();
    }

    /**
     * Load data from the server based on search parameters
     *
     * This method is called by the controller when search parameters change
     * (e.g., groupby, filters, domain). After loading the data, this.notify()
     * is called to signal the data change, which triggers the renderer's onPatched
     * hook to update the library instance.
     *
     * @param {SearchParams} searchParams
     */
    async load(searchParams) {
        this.searchParams = searchParams;

        // On first load, compute the initial visible range and persist it so
        // later fetchData() calls reuse it.
        if (!this.metaData.startDate || !this.metaData.stopDate) {
            const params = this._getInitialRangeParams(searchParams);
            this.metaData = {...this.metaData, ...params};
        }

        await this._fetchData();
        this.notify();
    }

    // -------------------------------------------------------------------------
    // Public
    // -------------------------------------------------------------------------

    /**
     * Fetches data with optional parameters.
     * @param {Object} params - Optional parameters for data fetching
     */
    async fetchData(params) {
        // Update metaData with new params if provided
        if (params) {
            this.metaData = {...this.metaData, ...params};
        }
        await this._fetchData();
        this.useSampleModel = false;
        this.notify();
    }

    /**
     * @returns {String|null} The field used for resource grouping: the current
     * search group-by, or the `resource`/`default_group_by` arch attribute.
     */
    get groupByField() {
        return (
            (this.searchParams?.groupBy && this.searchParams.groupBy[0]) ||
            this.metaData.resource
        );
    }

    /**
     * @param {Object} params
     * @param {String} [params.resource]
     * @param {DateTime} [params.start]
     * @param {DateTime} [params.stop]
     * @returns {Record<string, any>}
     */
    getDialogContext(params) {
        /** @type {Record<string, any>} */
        const context = {...(this.searchParams?.context || {})};

        if (params.start) {
            // Convert DayPilot date to Odoo format if needed
            context[`default_${this.metaData.dateStartField}`] =
                this._convertToOdooDate(params.start);
        }
        if (params.stop) {
            // Convert DayPilot date to Odoo format if needed
            context[`default_${this.metaData.dateStopField}`] = this._convertToOdooDate(
                params.stop
            );
        }
        if (params.resource && this.groupByField) {
            // Default the grouped field (e.g. user_id) to the clicked column.
            context[`default_${this.groupByField}`] = this.toResourceId(
                params.resource
            );
        }

        return context;
    }

    /**
     * Coerce a DayPilot resource/column id to the type expected by the server:
     * a number when the value is numeric, the original string otherwise.
     * @param {String|Number} value
     * @returns {Number|String}
     */
    toResourceId(value) {
        const numeric = parseInt(value, 10);
        return String(numeric) === String(value) ? numeric : value;
    }

    /**
     * Convert DayPilot date to Odoo format
     * @param {any} date - Date from DayPilot (could be Date object, string, or DateTime)
     * @returns {String} Odoo-compatible date string (YYYY-MM-DD HH:MM:SS)
     */
    _convertToOdooDate(date) {
        if (!date) return null;

        // Handle DayPilot date objects (which have a value property)
        let dateValue = date;
        if (typeof date === "object" && date.value !== undefined) {
            dateValue = date.value;
        }

        // If already a string in local format, return as-is
        if (
            typeof dateValue === "string" &&
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateValue)
        ) {
            return dateValue;
        }

        // Parse the date - check if it has timezone info (UTC)
        // DayPilot sends dates in UTC format (e.g., "2026-07-22T17:29:00Z")
        // We need to parse them as UTC, not local time

        let dt = null;
        if (typeof dateValue === "string" && dateValue.endsWith("Z")) {
            // Parse as UTC
            dt = luxon.DateTime.fromISO(dateValue, {zone: "UTC"});
        } else {
            // Parse as local time
            dt = luxon.DateTime.fromISO(dateValue, {zone: "local"});
        }

        if (!dt.isValid) {
            throw new Error(`Invalid date format: ${date}`);
        }

        return serializeDateTime(dt);
    }

    /**
     * @returns {Array} The list of resources for the calendar
     */
    get resources() {
        return this.data.resources || [];
    }

    /**
     * @returns {Array} The list of events for the calendar
     */
    get events() {
        return this.data.events || [];
    }

    /**
     * Get date range from a given date and range ID
     * @param {String} rangeId - The range ID (day, week, month)
     * @param {DateTime} date - The focus date
     * @returns {Object} Object with startDate, stopDate, focusDate
     */
    getRangeFromDate(rangeId, date) {
        return {
            focusDate: date,
            startDate: date.startOf(rangeId),
            stopDate: date.endOf(rangeId),
        };
    }

    /**
     * Get initial range params
     */
    _getInitialRangeParams({context = {}}) {
        const ctxStart =
            context.default_start_date && deserializeDate(context.default_start_date);
        const ctxStop =
            context.default_stop_date && deserializeDate(context.default_stop_date);

        // The header displays focusDate: use the requested date, or today.
        const focusDate = ctxStart || luxon.DateTime.local().startOf("day");
        const range =
            ctxStart && ctxStop
                ? {startDate: ctxStart, stopDate: ctxStop}
                : this.getRangeFromDate(this.metaData.defaultRange || "day", focusDate);
        return {...range, focusDate};
    }

    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    _buildReadSpecification(groupByField) {
        const {metaData} = this;
        const fields = metaData.fields;
        const fieldsToRead = new Set([
            "id",
            "display_name",
            metaData.dateStartField,
            metaData.dateStopField,
            metaData.tooltip || "daypilot_tooltip",
            ...(metaData.fieldNames || []),
        ]);
        if (groupByField) {
            fieldsToRead.add(groupByField);
        }

        const readSpecification = {};
        for (const fieldName of fieldsToRead) {
            if (fields[fieldName]) {
                readSpecification[fieldName] = {};
                if (fields[fieldName].type === "many2one") {
                    readSpecification[fieldName].fields = {display_name: {}};
                }
            }
        }
        return readSpecification;
    }

    /**
     * Fetches records to display.
     *
     * @protected
     */
    async _fetchData() {
        const {metaData} = this;
        const {startDate, stopDate, resModel} = metaData;
        const groupByField = this.groupByField;
        const domain = this.searchParams.domain || [];

        try {
            // Use server-side get_daypilot_data for all cases (grouped and non-grouped)
            const daypilotData = await this.orm.call(
                resModel,
                "get_daypilot_data",
                [],
                {
                    context: this.searchParams.context || {},
                    domain,
                    groupby: groupByField ? [groupByField] : [],
                    read_specification: this._buildReadSpecification(groupByField),
                    start_date: startDate ? serializeDateTime(startDate) : null,
                    stop_date: stopDate ? serializeDateTime(stopDate) : null,
                    unavailability_fields: groupByField ? [groupByField] : [],
                    business_hours_start: metaData.businessHoursStart,
                    business_hours_end: metaData.businessHoursEnd,
                    date_start_field: metaData.dateStartField,
                    date_stop_field: metaData.dateStopField,
                }
            );

            this.data = {
                resources: daypilotData.resources || [],
                events: this._convertToDayPilotEvents(
                    daypilotData.records || [],
                    groupByField
                ),
                unavailability: this._convertToDayPilotUnavailability(
                    daypilotData.unavailabilities?.[groupByField] || {}
                ),
            };
        } catch {
            this.notification.add(_t("Failed to load data"), {type: "danger"});
            this.data = {resources: [], events: []};
        }
    }

    _convertToDayPilotEvents(records, groupByField) {
        const {dateStartField, dateStopField} = this.metaData;

        return records
            .map((record) => {
                // Database stores datetimes in UTC (e.g., "2026-06-24 08:00:00")
                // deserializeDateTime converts UTC to local timezone (e.g., 08:00 UTC -> 09:00 local for +01:00)
                // This is the correct behavior - we want to display times in the user's local timezone
                const startDate = deserializeDateTime(record[dateStartField]);
                const stopDate = deserializeDateTime(record[dateStopField]);

                // Skip records with missing date fields
                if (!startDate || !stopDate) {
                    return null;
                }

                const event = {
                    id: record.id,
                    // Format without timezone offset so DayPilot treats the string as local time
                    // DayPilot doesn't handle timezone-aware ISO strings well, so we strip the offset
                    // and let DayPilot assume the time is already in the user's local timezone
                    start: startDate.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
                    end: stopDate.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
                    text: record.display_name || record.name || record.id,
                    record: record,
                };

                // Add resource if grouped. Must match the column id (the record
                // id), not the display name.
                if (groupByField) {
                    const resourceId = record[groupByField];
                    let id = resourceId;
                    if (Array.isArray(resourceId)) {
                        id = resourceId[0];
                    } else if (
                        resourceId &&
                        typeof resourceId === "object" &&
                        resourceId.id
                    ) {
                        id = resourceId.id;
                    }
                    event.resource = String(id);
                }

                return event;
            })
            .filter(Boolean);
    }

    /**
     * Convert server-side unavailability intervals (UTC) to DayPilot local time.
     *
     * DayPilot renders cells in the user's local timezone, while the server
     * returns unavailability intervals as UTC naive datetimes. Converting them
     * here ensures the grey unavailable cells align with events and the visible
     * shift boundaries.
     */
    _convertToDayPilotUnavailability(unavailabilities) {
        const result = {};
        for (const [resourceId, intervals] of Object.entries(unavailabilities)) {
            result[resourceId] = intervals.map((interval) => ({
                start: deserializeDateTime(interval.start).toFormat(
                    "yyyy-MM-dd'T'HH:mm:ss"
                ),
                stop: deserializeDateTime(interval.stop).toFormat(
                    "yyyy-MM-dd'T'HH:mm:ss"
                ),
            }));
        }
        return result;
    }

    /**
     * Reschedule an event to new times.
     *
     * @param {Number} id - The record ID to reschedule
     * @param {Record<string, any>} data - The data to update (start, stop, etc.)
     * @returns {Promise<void>}
     */
    async reschedule(id, data) {
        const {resModel} = this.metaData;
        const converted = {};
        for (const [key, value] of Object.entries(data)) {
            converted[key] = [
                this.metaData.dateStartField,
                this.metaData.dateStopField,
            ].includes(key)
                ? this._convertToOdooDate(value)
                : value;
        }
        await this.mutex.exec(() => this.orm.write(resModel, [id], converted));
        await this.fetchData();
    }
}

registry.category("models").add("daypilot", DayPilotModel);
