/**
 * DayPilot Renderer
 *
 * This renderer follows the same reactivity pattern as CalendarCommonRenderer from web.calendar:
 * - https://github.com/odoo/odoo/blob/19.0/addons/web/static/src/views/calendar/calendar_common/calendar_common_renderer.js
 *
 * Reactivity Pattern:
 * 1. onMounted: Initialize DayPilot calendar after component is mounted
 * 2. onPatched: Update calendar when model data changes (reactivity)
 * 3. onWillUnmount: Clean up the library instance
 *
 * This approach ensures:
 * - Automatic reactivity when model data changes
 * - Clean separation of concerns
 * - Proper cleanup to prevent memory leaks
 *
 * Note: Unlike web.calendar which uses a custom hook (useFullCalendar), this implementation
 * uses direct OWL hooks to avoid asset bundle loading issues. The reactivity pattern is the same.
 */

import {Component, onMounted, onPatched, onWillUnmount, useRef} from "@odoo/owl";
import {DayPilotRendererControls} from "./daypilot_renderer_controls.esm";
import {_t} from "@web/core/l10n/translation";
import {renderToString} from "@web/core/utils/render";
import {useService} from "@web/core/utils/hooks";

// These classes must stay on the DayPilot root element for the flex scroll
// layout in daypilot_view.scss; the class attribute in daypilot_renderer.xml
// must contain the same list.
const DAYPILOT_CONTAINER_CLASSES = "o_daypilot_container h-100";

export class DayPilotRenderer extends Component {
    static props = ["model", "class", "create", "openDialog"];
    static template = "web_daypilot.DayPilotRenderer";
    static components = {
        DayPilotRendererControls,
    };

    setup() {
        this.notification = useService("notification");
        this.daypilotRef = useRef("daypilot");
        // Non-reactive bookkeeping: these are written inside onPatched,
        // where reactive writes would schedule another render and a
        // redundant calendar.update().
        this._calendar = null;
        this._lastResourcesHash = null;
        this._lastScale = null;
        this._lastCellDuration = null;
        this._lastStartDate = null;
        this._lastStopDate = null;
        this._initializing = null;
        this._loadingLibrary = null;

        // Initialize DayPilot calendar after component is mounted
        // This follows the same pattern as useFullCalendar in web.calendar
        onMounted(async () => {
            await this.initializeDayPilot();
        });

        // Update the calendar when the component is patched (props change)
        // This provides reactivity when model data changes due to groupby, filters, etc.
        // Similar to FullCalendar's refetchEvents() pattern
        onPatched(async () => {
            // Only update if model has data
            if (this.props.model && this.props.model.data) {
                await this.updateCalendar();
            }
        });

        // Clean up the library instance when component is unmounted
        // Prevents memory leaks
        onWillUnmount(() => {
            if (this._calendar) {
                this._calendar.dispose();
                this._calendar = null;
            }
        });
    }

    /**
     * Load DayPilot library dynamically
     *
     * This method loads the DayPilot library by injecting a script tag.
     * This is more reliable than relying on asset bundles in some cases.
     *
     * @returns {Promise<boolean>} True if library is loaded or was already loaded
     */
    async loadDayPilotLibrary() {
        if (window.DayPilot) {
            return true;
        }

        // Prevent multiple concurrent loading attempts
        if (this._loadingLibrary) {
            return this._loadingLibrary;
        }

        this._loadingLibrary = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/web_daypilot/static/src/lib/daypilot-lite.min.js";
            script.onload = () => {
                this._loadingLibrary = null;
                resolve(true);
            };
            script.onerror = () => {
                this._loadingLibrary = null;
                this.notification.add(_t("Failed to load DayPilot library"), {
                    type: "danger",
                });
                reject(false);
            };
            document.head.appendChild(script);
        });

        return this._loadingLibrary;
    }

    /**
     * Initialize DayPilot calendar
     *
     * Single-flight: onPatched can fire while the mount-time init is still
     * awaiting the library load, so concurrent callers share the in-flight
     * init instead of building a second calendar.
     */
    initializeDayPilot() {
        if (!this._initializing) {
            this._initializing = this._initDayPilot().finally(() => {
                this._initializing = null;
            });
        }
        return this._initializing;
    }

    /**
     * Load the library and build the calendar instance.
     */
    async _initDayPilot() {
        try {
            // Load the library dynamically
            await this.loadDayPilotLibrary();

            if (!window.DayPilot) {
                this.notification.add(_t("DayPilot library not available"), {
                    type: "danger",
                });
                return;
            }

            const el = this.daypilotRef.el;
            if (!el) {
                this.notification.add(_t("DayPilot element not found"), {
                    type: "danger",
                });
                return;
            }

            // The component may have been unmounted while the library loaded
            if (!el.isConnected) {
                return;
            }

            if (!el.id) {
                el.id = `daypilot-${Math.random().toString(36).slice(2, 9)}`;
            }

            // eslint-disable-next-line no-undef -- DayPilot is a global library loaded via web assets
            const calendar = new DayPilot.Calendar(el.id, this.options);
            calendar.init();
            this._lastResourcesHash = this.getResourcesHash(
                this.props.model?.resources || []
            );
            const {metaData} = this.props.model || {};
            this._lastScale = metaData?.scale;
            this._lastCellDuration = metaData?.timeSlotDuration;
            this._lastStartDate = metaData?.startDate?.toISODate();
            this._lastStopDate = metaData?.stopDate?.toISODate();
            this._calendar = calendar;
        } catch (error) {
            // Leave no stale snapshot behind: the next patch must detect a
            // change and retry the init.
            this._lastResourcesHash = null;
            console.error("Failed to initialize DayPilot calendar", error);
            this.notification.add(_t("Failed to initialize DayPilot calendar"), {
                type: "danger",
            });
        }
    }

    /**
     * Generate a simple hash of resources to detect structure changes.
     * The name is part of the hash so a resource rename triggers a re-init,
     * which is the only way to refresh column headers on a live instance.
     */
    getResourcesHash(resources) {
        if (!resources || resources.length === 0) {
            return "empty";
        }
        return resources.map((r) => `${r.id}-${r.name}`).join("|");
    }

    /**
     * Update the calendar with new data
     *
     * This method is called by the onPatched hook when model data changes.
     * It updates the DayPilot calendar instance with the new events, columns, and date range.
     */
    // eslint-disable-next-line complexity -- updateCalendar has complexity due to multiple conditional checks for library loading and data updates
    async updateCalendar() {
        // Ensure library is loaded before updating
        if (!window.DayPilot) {
            await this.loadDayPilotLibrary();
        }

        if (!window.DayPilot) {
            this.notification.add(_t("DayPilot library not available"), {
                type: "danger",
            });
            return;
        }

        const {model} = this.props;
        const {metaData} = model;
        const resources = model.resources;
        const events = model.events;

        // Check if resources structure, scale or date range changed
        const currentResourcesHash = this.getResourcesHash(resources);
        const structureChanged = this._lastResourcesHash !== currentResourcesHash;
        // DayPilot does not rebuild the timeline when `scale`, `cellDuration`,
        // `startDate` or `days` are changed on a live instance, so those
        // changes require a full re-init just like a resource-structure change.
        const layoutChanged =
            this._lastScale !== metaData?.scale ||
            this._lastCellDuration !== metaData?.timeSlotDuration ||
            this._lastStartDate !== metaData?.startDate?.toISODate() ||
            this._lastStopDate !== metaData?.stopDate?.toISODate();

        if (structureChanged || layoutChanged) {
            // _initDayPilot refreshes the _last* snapshot after a
            // successful init.
            if (this._calendar) {
                this._calendar.dispose();
                this._calendar = null;
            }
            await this.initializeDayPilot();
            return;
        }

        // Only update events if calendar exists and structure hasn't changed
        if (!this._calendar) {
            return;
        }

        // Only update events - don't touch columns or view type
        this._calendar.events.list = events;

        // Re-render the calendar
        try {
            this._calendar.update();
        } catch {
            this.notification.add(_t("Failed to update calendar"), {type: "danger"});
        }
    }

    /**
     * Returns DayPilot configuration options
     *
     * This getter is called during initialization and for reactive updates.
     * It returns the configuration based on the current model data.
     */

    get options() {
        const {model} = this.props;
        const {metaData} = model;
        const resources = model.resources;
        const events = model.events;

        const config = {
            // Update() rewrites the root's className to
            // `calendar_default_main [+ cssClass]`, so the layout classes
            // must be passed here to survive every update.
            cssClass: DAYPILOT_CONTAINER_CLASSES,
            viewType: resources.length > 0 ? "Resources" : "Day",
            events,
            timeHeaders: [{groupBy: "Day"}, {groupBy: "Hour"}],
            scale: metaData.scale,
            cellDuration: metaData.timeSlotDuration,
            businessBeginsHour: metaData.businessHoursStart,
            businessEndsHour: metaData.businessHoursEnd,
            showNonBusiness: !metaData.businessHoursOnly,
            onEventClick: (args) => this.onEventClick(args),
            onEventMoved: (args) => this.onEventMoved(args),
            onEventResized: (args) => this.onEventResized(args),
            onTimeRangeSelected: (args) => this.onTimeRangeSelected(args),
        };

        // Add event template callback if configured
        if (metaData.eventTemplate) {
            config.onBeforeEventRender = (args) => this.onBeforeEventRender(args);
        }

        // Add cell styling callback for availability
        config.onBeforeCellRender = (args) => this.onBeforeCellRender(args);

        // Add columns only if resources exist (grouped view)
        if (resources.length > 0) {
            config.columns = resources.map((r) => ({
                id: String(r.id),
                name: r.name,
            }));
        }

        // Add date range if available
        if (metaData.startDate && metaData.stopDate) {
            // Convert Luxon DateTime to DayPilot-compatible format
            const startDateStr =
                metaData.startDate.toISODate() ||
                metaData.startDate.toFormat("yyyy-MM-dd");
            // StopDate is end-of-range (23:59:59.999), so ceil to whole days
            const days = Math.ceil(
                metaData.stopDate.diff(metaData.startDate, "days").days
            );
            config.startDate = startDateStr;
            config.days = days;
        }

        return config;
    }

    onEventClick(args) {
        const record = args.e.data.record;

        if (record) {
            this.props.openDialog({resId: record.id});
        }
    }

    onBeforeEventRender(args) {
        const record = args.data.record;

        if (record) {
            const tooltipField =
                this.props.model.metaData.tooltip || "daypilot_tooltip";
            if (tooltipField && record[tooltipField]) {
                let tooltip = record[tooltipField];
                if (Array.isArray(tooltip) && tooltip.length >= 2) {
                    tooltip = tooltip[1];
                } else if (tooltip && typeof tooltip === "object") {
                    tooltip = tooltip.display_name || tooltip.name || String(tooltip);
                }
                args.data.toolTip = String(tooltip);
            }

            try {
                // Format start time for display from the event data
                const startTime = args.data.start.toString("HH:mm");
                const stopTime = args.data.end.toString("HH:mm");

                // Render the QWeb template for the event
                const template = this.props.model.metaData.eventTemplate;
                args.data.html = renderToString(template, {
                    startTime,
                    stopTime,
                    record,
                    event: {
                        start: startTime,
                        end: stopTime,
                        text: args.data.text,
                    },
                });
            } catch (error) {
                console.error("DayPilot: Failed to render event template", error);
                // Fallback to simple text if template rendering fails
                args.data.html = record.display_name || record.name || record.id;
            }
        }
    }

    _isCellUnavailable(args, cellStart, cellEnd) {
        const intervals =
            this.props.model.data.unavailability?.[parseInt(args.cell.resource, 10)] ||
            [];
        return intervals.some(
            (i) => cellStart < new Date(i.stop) && cellEnd > new Date(i.start)
        );
    }

    onBeforeCellRender(args) {
        const {metaData} = this.props.model;
        const cellStart = new Date(args.cell.start.value);
        const cellEnd = new Date(args.cell.end.value);
        const now = new Date();

        const isUnavailable =
            args.cell.resource && this._isCellUnavailable(args, cellStart, cellEnd);
        const isCurrentTime =
            metaData.showCurrentTime !== false && now >= cellStart && now < cellEnd;

        // Apply styling using DayPilot's cell properties
        // Note: Using backColor instead of cssClass because DayPilot Lite's CSS class application
        // doesn't work reliably - the classes are added to the DOM but DayPilot's default
        // cell styling has higher CSS specificity and overrides custom styles.
        // The backColor API directly sets the inline style which works consistently.
        if (isCurrentTime && isUnavailable) {
            args.cell.properties.backColor = "#ffe6a7";
        } else if (isCurrentTime) {
            args.cell.properties.backColor = "#fff3cd";
        } else if (isUnavailable) {
            args.cell.properties.backColor = "#ced4da";
        }
    }

    async onEventMoved(args) {
        const {model} = this.props;
        const {dateStartField, dateStopField} = model.metaData;
        const resourceField = model.groupByField;
        const data = {
            [dateStartField]: args.e.start().toString(),
            [dateStopField]: args.e.end().toString(),
        };
        if (resourceField && args.newResource !== undefined) {
            data[resourceField] = model.toResourceId(args.newResource);
        }
        await this._rescheduleEvent(args, data, _t("Failed to move event"));
    }

    async onEventResized(args) {
        const {dateStartField, dateStopField} = this.props.model.metaData;
        await this._rescheduleEvent(
            args,
            {
                [dateStartField]: args.e.start().toString(),
                [dateStopField]: args.e.end().toString(),
            },
            _t("Failed to resize event")
        );
    }

    async _rescheduleEvent(args, data, failureMessage) {
        const {model} = this.props;
        const record = args.e.data.record;

        if (record && model.metaData.canEdit) {
            try {
                await model.reschedule(record.id, data);
            } catch {
                this.notification.add(failureMessage, {type: "danger"});
                args.preventDefault();
            }
        }
    }

    async onTimeRangeSelected(args) {
        const {model} = this.props;
        if (!model.metaData.canCreate) {
            return;
        }
        const context = model.getDialogContext({
            resource: args.resource,
            start: args.start,
            stop: args.end,
        });
        // Delegate to the controller, which opens the configured form view
        // (formViewId from the `form_view_id` arch attribute) in a dialog.
        this.props.create(context);
        args.control.clearSelection();
    }
}
