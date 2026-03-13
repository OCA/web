/** @odoo-module **/
/* global vis */
/**
 * Copyright 2024 Tecnativa - Carlos López
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */
import {
    Component,
    onMounted,
    onWillStart,
    onWillUpdateProps,
    useRef,
    useState,
} from "@odoo/owl";
import {TimelineCanvas} from "./timeline_canvas.esm";
import {loadBundle} from "@web/core/assets";
import {renderToString} from "@web/core/utils/render";
import {useService} from "@web/core/utils/hooks";

const {DateTime} = luxon;

export class TimelineRenderer extends Component {
    setup() {
        this.orm = useService("orm");
        this.rootRef = useRef("root");
        this.canvasRef = useRef("canvas");
        this.model = this.props.model;
        this.params = this.model.params;
        this.mode = useState({data: this.params.mode});
        this.options = this.params.options;
        this.min_height = this.params.min_height;
        this.date_start = this.params.date_start;
        this.dependency_arrow = this.params.dependency_arrow;
        this.fields = this.params.fields;
        this.timeline = false;
        this.initial_data_loaded = false;
        this.canvas_ref = $(renderToString("TimelineView.Canvas", {}));
        onWillUpdateProps(async (props) => {
            this.on_data_loaded(props.model.data);
        });
        onWillStart(async () => {
            await loadBundle("web_timeline.vis-timeline_lib");
        });
        onMounted(() => {
            // Prevent Double Rendering on Updates
            if (!this.timeline) {
                this.init_timeline();
            }
            this.on_attach_callback();
        });
    }

    /**
     * Triggered when the timeline is attached to the DOM.
     */
    on_attach_callback() {
        const $root = $(this.rootRef.el);
        $root.addClass(this.params.class);
        const height =
            $root.parent().height() - $root.find(".oe_timeline_buttons").height();
        if (height > this.min_height && this.timeline) {
            this.timeline.setOptions({
                height: height,
            });
        }
    }
    /**
     * Set the timeline window to today (day).
     *
     * @private
     */
    _onTodayClicked() {
        this.mode.data = "today";
        if (this.timeline) {
            this.timeline.setWindow({
                start: DateTime.now().toJSDate(),
                end: DateTime.now().plus({hours: 24}).toJSDate(),
            });
        }
    }

    /**
     * Scale the timeline window to a day.
     *
     * @private
     */
    _onScaleDayClicked() {
        this.mode.data = "day";
        this._scaleCurrentWindow(() => 24);
    }

    /**
     * Scale the timeline window to a week.
     *
     * @private
     */
    _onScaleWeekClicked() {
        this.mode.data = "week";
        this._scaleCurrentWindow(() => 24 * 7);
    }

    /**
     * Scale the timeline window to a month.
     *
     * @private
     */
    _onScaleMonthClicked() {
        this.mode.data = "month";
        this._scaleCurrentWindow((start) => 24 * start.daysInMonth);
    }

    /**
     * Scale the timeline window to a year.
     *
     * @private
     */
    _onScaleYearClicked() {
        this.mode.data = "year";
        this._scaleCurrentWindow((start) => 24 * (start.isInLeapYear ? 366 : 365));
    }

    /**
     * Scales the timeline window based on the current window.
     *
     * @param {function} getHoursFromStart Function which returns the timespan
     * (in hours) the window must be scaled to, starting from the "start" moment.
     * @private
     */
    _scaleCurrentWindow(getHoursFromStart) {
        if (this.timeline) {
            const start = DateTime.fromJSDate(this.timeline.getWindow().start);
            const end = start.plus({hours: getHoursFromStart(start)});
            this.timeline.setWindow(start.toJSDate(), end.toJSDate());
        }
    }

    /**
     * Computes the initial visible window.
     *
     * @private
     */
    _computeMode() {
        if (this.mode.data) {
            let start = false,
                end = false;
            const current_date = DateTime.now();
            switch (this.mode.data) {
                case "day":
                    start = current_date.startOf("day");
                    end = current_date.endOf("day");
                    break;
                case "week":
                    start = current_date.startOf("week");
                    end = current_date.endOf("week");
                    break;
                case "month":
                    start = current_date.startOf("month");
                    end = current_date.endOf("month");
                    break;
            }
            if (end && start) {
                this.options.start = start.toJSDate();
                this.options.end = end.toJSDate();
            } else {
                this.mode.data = "fit";
            }
        }
    }

    /**
     * Initializes the timeline
     * (https://visjs.github.io/vis-timeline/docs/timeline).
     *
     * @private
     */
    init_timeline() {
        this._computeMode();
        this.options.editable = {};
        if (this.model.canEdit) {
            this.options.onMove = this.on_move.bind(this);
            this.options.onUpdate = this.on_update.bind(this);
            // Drag items horizontally
            this.options.editable.updateTime = true;
            // Drag items from one group to another
            this.options.editable.updateGroup = true;
            if (this.model.canCreate) {
                this.options.onAdd = this.on_add.bind(this);
                // Add new items by double tapping
                this.options.editable.add = true;
            }
        }
        if (this.model.canDelete) {
            this.options.onRemove = this.on_remove.bind(this);
            // Delete an item by tapping the delete button top right
            this.options.editable.remove = true;
        }
        // Configure XSS filtering options to mitigate potential security risks.
        // Disabling XSS filtering can lead to vulnerabilities, as highlighted in:
        // - CVE-2020-28487 (https://www.cve.org/CVERecord?id=CVE-2020-28487)
        // - https://github.com/visjs/vis-timeline/pull/840
        // The solution is to define a whitelist of allowed HTML elements and attributes.
        // TODO: Check if this can be removed when this PR is merged: https://github.com/visjs/vis-timeline/pull/1860
        this.options.xss = {
            filterOptions: {
                whiteList: this.getXSSWhiteList(),
            },
        };
        this.timeline = new vis.Timeline(this.canvasRef.el, {}, this.options);
        this.timeline.on("doubleClick", this.on_timeline_click.bind(this));
        if (!this.options.onUpdate) {
            // In read-only mode, catch double-clicks this way.
            this.timeline.on("doubleClick", this.on_timeline_double_click.bind(this));
        }
        this.$centerContainer = $(this.timeline.dom.centerContainer);
        this.canvas = new TimelineCanvas(this.canvas_ref);
        this.canvas_ref.appendTo(this.$centerContainer);
        this.timeline.on("changed", () => {
            this.draw_canvas();
            this.load_initial_data();
        });
    }
    /**
     * Returns the XSS whitelist for the timeline library.
     * This is used to filter out potentially harmful HTML elements and attributes.
     * The white list allows only specific elements and attributes to be rendered.
     * This is important for security reasons, as it helps prevent XSS attacks.
     * @returns {Object} The XSS white list.
     * Key: element name; value: array of allowed attributes.
     */
    getXSSWhiteList() {
        // Add more elements to the whitelist as needed.
        return {
            b: [],
            div: ["class", "style"],
            span: ["class", "name"],
            small: ["class", "name"],
            img: ["src", "width", "height", "alt", "loading", "class"],
        };
    }

    /**
     * Clears and draws the canvas items.
     *
     * @private
     */
    draw_canvas() {
        this.canvas.clear();
        if (this.dependency_arrow) {
            this.draw_dependencies();
        }
    }

    /**
     * Draw item dependencies on canvas.
     *
     * @private
     */
    draw_dependencies() {
        const items = this.timeline.itemSet.items;
        const datas = this.timeline.itemsData;
        if (!items || !datas) {
            return;
        }
        const keys = Object.keys(items);
        for (const key of keys) {
            const item = items[key];
            const data = datas.get(key);
            if (!data || !data.evt) {
                return;
            }
            for (const id of data.evt[this.dependency_arrow]) {
                for (const k of keys) {
                    if (k.split("_")[0].toString() === id.toString()) {
                        this.draw_dependency(item, items[k]);
                    }
                }
            }
        }
    }

    /**
     * Draws a dependency arrow between 2 timeline items.
     *
     * @param {Object} from Start timeline item
     * @param {Object} to Destination timeline item
     * @param {Object} options
     * @param {Object} options.line_color Color of the line
     * @param {Object} options.line_width The width of the line
     * @private
     */
    draw_dependency(from, to, options) {
        if (!from.displayed || !to.displayed) {
            return;
        }
        if (!from.dom || !from.dom.box || !to.dom || !to.dom.box) {
            return;
        }
        const defaults = Object.assign({line_color: "black", line_width: 1}, options);
        this.canvas.draw_arrow(
            from.dom.box,
            to.dom.box,
            defaults.line_color,
            defaults.line_width
        );
    }

    /* Load initial data. This is called once after each redraw; we only handle the first one.
     * Deferring this initial load here avoids rendering issues. */
    load_initial_data() {
        if (!this.initial_data_loaded) {
            this.on_data_loaded(this.model.data);
            this.initial_data_loaded = true;
            this.timeline.redraw();
        }
    }

    /**
     * Set groups and events.
     *
     * @param {Object[]} records
     * @param {Boolean} adjust_window
     * @private
     */
    async on_data_loaded(records, adjust_window) {
        const data = [];
        for (const record of records) {
            if (record[this.date_start]) {
                const transformed = this.model._event_data_transform(record);
                if (Array.isArray(transformed)) {
                    data.push(...transformed);
                } else {
                    data.push(transformed);
                }
            }
        }
        const groups = await this.split_groups(records);
        this.groups = groups;
        // Ensure relevant groups are visible
        for (const d of data) {
            const itemGroupPathJson = d.group;
            try {
                const itemPathSegments = JSON.parse(itemGroupPathJson);
                for (let i = 0; i < itemPathSegments.length; i++) {
                    const subPathJson = JSON.stringify(
                        itemPathSegments.slice(0, i + 1)
                    );
                    const group = groups.find((g) => g.id === subPathJson);
                    if (group && !group.visible) {
                        group.visible = true;
                    }
                }
            } catch (e) {
                console.error(
                    "Error processing group visibility for item. Group JSON string was:",
                    itemGroupPathJson,
                    "Error:",
                    e
                );
            }
        }
        this.timeline.setGroups(groups);
        this.timeline.setItems(data);
        const mode = !this.mode.data || this.mode.data === "fit";
        const adjust = typeof adjust_window === "undefined" || adjust_window;
        if (mode && adjust) {
            this.timeline.fit();
        }
    }

    /**
     * Get the groups.
     *
     * @param {Object[]} records
     * @private
     * @returns {Array}
     */
    async split_groups(records) {
        if (this.model.last_group_bys.length === 0) {
            return [];
        }
        const groups = [];
        let seq = 1;

        const groupLevel = this.model.last_group_bys.reduce((acc, g, index) => {
            acc[g] = index + 1;
            return acc;
        }, {});

        // Memoization for M2M name_get calls
        const m2mNameCache = {};
        const getM2MNames = async (model, ids) => {
            const cacheKey = `${model}-${ids.sort().join(",")}`;
            if (m2mNameCache[cacheKey]) {
                return m2mNameCache[cacheKey];
            }
            const names = await this.orm.read(model, ids, ["display_name"]);
            const result = names.map((name) => ({
                id: name.id,
                content: name.display_name,
            }));
            m2mNameCache[cacheKey] = result;
            return result;
        };

        const createGroup = (segmentObject, displayName, parentGroupsInput, lvl) => {
            const parentGroups =
                parentGroupsInput && parentGroupsInput.length
                    ? parentGroupsInput
                    : [null];
            const createdGroups = [];

            for (const parent of parentGroups) {
                let newPathSegments = [];
                if (parent && parent.id) {
                    try {
                        const parentPathSegments = JSON.parse(parent.id);
                        newPathSegments = [...parentPathSegments, segmentObject];
                    } catch (e) {
                        console.error("Error parsing parent group ID:", parent.id, e);
                        newPathSegments = [segmentObject];
                    }
                } else {
                    newPathSegments = [segmentObject];
                }
                const subGroupId = JSON.stringify(newPathSegments);

                let group = groups && groups.find((g) => g.id === subGroupId);
                if (!group) {
                    const group_record_values = {};
                    newPathSegments.forEach((segment) => {
                        // Do not set m2m fields for group_record_values
                        if (
                            this.fields[segment.field] &&
                            this.fields[segment.field].type === "many2many"
                        ) {
                            return;
                        }
                        group_record_values[segment.field] = segment.value;
                    });

                    group = {
                        id: subGroupId,
                        content: displayName || "UNASSIGNED",
                        group_record_values,
                        order: displayName === "UNASSIGNED" ? seq++ : seq++,
                        treeLevel: lvl,
                        visible: displayName !== "UNASSIGNED",
                    };
                    groups.push(group);
                }
                createdGroups.push(group);

                if (parent && parent.id) {
                    if (!parent.nestedGroups) {
                        parent.nestedGroups = [];
                    }
                    if (!parent.nestedGroups.includes(group.id)) {
                        parent.nestedGroups.push(group.id);
                    }
                }
            }
            return createdGroups;
        };

        /* eslint-disable complexity */
        const processGroup = async (
            grouped_field_spec,
            groupValue,
            groupLvl,
            parentGroups
        ) => {
            const base_grouped_field = grouped_field_spec.includes(":")
                ? grouped_field_spec.split(":")[0]
                : grouped_field_spec;
            const fieldInfo = this.fields[base_grouped_field];

            if (fieldInfo.type === "many2many") {
                const m2mIds = Array.isArray(groupValue)
                    ? groupValue
                    : groupValue
                    ? [groupValue]
                    : [];
                if (m2mIds.length === 0) {
                    return createGroup(
                        {
                            field: base_grouped_field,
                            value: false,
                            spec: grouped_field_spec,
                        },
                        "UNASSIGNED",
                        parentGroups,
                        groupLvl
                    );
                }
                const listValues = await getM2MNames(fieldInfo.relation, m2mIds);
                const createdM2mGroups = [];
                for (const vals of listValues) {
                    if (m2mIds.includes(vals.id)) {
                        const newM2mGroups = createGroup(
                            {
                                field: base_grouped_field,
                                value: vals.id,
                                spec: grouped_field_spec,
                            },
                            vals.content,
                            parentGroups,
                            groupLvl
                        );
                        createdM2mGroups.push(...newM2mGroups);
                    }
                }
                if (createdM2mGroups.length === 0 && m2mIds.length > 0) {
                    for (const id of m2mIds) {
                        const newM2mGroups = createGroup(
                            {
                                field: base_grouped_field,
                                value: id,
                                spec: grouped_field_spec,
                            },
                            `ID: ${id}`,
                            parentGroups,
                            groupLvl
                        );
                        createdM2mGroups.push(...newM2mGroups);
                    }
                } else if (m2mIds.length === 0) {
                    return createGroup(
                        {
                            field: base_grouped_field,
                            value: false,
                            spec: grouped_field_spec,
                        },
                        "UNASSIGNED",
                        parentGroups,
                        groupLvl
                    );
                }
                return createdM2mGroups;
            } else if (
                grouped_field_spec.includes(":") &&
                (fieldInfo.type === "date" || fieldInfo.type === "datetime")
            ) {
                const displayName = groupValue ? String(groupValue) : "UNASSIGNED";
                return createGroup(
                    {
                        field: base_grouped_field,
                        value: groupValue,
                        spec: grouped_field_spec,
                    },
                    displayName,
                    parentGroups,
                    groupLvl
                );
            } else if (Array.isArray(groupValue)) {
                // Standard [id, name] for m2o, etc.
                const id = groupValue[0];
                const name = groupValue[1];
                return createGroup(
                    {
                        field: base_grouped_field,
                        value: id,
                        spec: grouped_field_spec,
                    },
                    name,
                    parentGroups,
                    groupLvl
                );
            } else if (
                groupValue !== undefined &&
                groupValue !== null &&
                groupValue !== false
            ) {
                // Simple type (string, number, boolean true)
                if (fieldInfo.relation && typeof groupValue === "number") {
                    const names = await getM2MNames(fieldInfo.relation, [groupValue]);
                    const displayName =
                        names.length > 0 ? names[0].content : `ID: ${groupValue}`;
                    return createGroup(
                        {
                            field: base_grouped_field,
                            value: groupValue,
                            spec: grouped_field_spec,
                        },
                        displayName,
                        parentGroups,
                        groupLvl
                    );
                }
                // For selection fields, look up the human-readable label
                if (fieldInfo.type === "selection" && fieldInfo.selection) {
                    const selEntry = fieldInfo.selection.find(
                        ([val]) => val === groupValue
                    );
                    const displayName = selEntry ? selEntry[1] : String(groupValue);
                    return createGroup(
                        {
                            field: base_grouped_field,
                            value: groupValue,
                            spec: grouped_field_spec,
                        },
                        displayName,
                        parentGroups,
                        groupLvl
                    );
                }
                return createGroup(
                    {
                        field: base_grouped_field,
                        value: groupValue,
                        spec: grouped_field_spec,
                    },
                    String(groupValue),
                    parentGroups,
                    groupLvl
                );
            }
            return createGroup(
                {field: base_grouped_field, value: false, spec: grouped_field_spec},
                "UNASSIGNED",
                parentGroups,
                groupLvl
            );
        };

        for (const evt of records) {
            let currentParentGroups = [null];
            for (const grouped_field_spec of this.model.last_group_bys) {
                const groupValue = evt[grouped_field_spec];
                const groupLvl = groupLevel[grouped_field_spec];
                currentParentGroups = await processGroup(
                    grouped_field_spec,
                    groupValue,
                    groupLvl,
                    currentParentGroups
                );
                if (!currentParentGroups || currentParentGroups.length === 0) {
                    break;
                }
            }
        }
        // Ensure unique group ordering
        groups.sort((a, b) => {
            if (a.treeLevel !== b.treeLevel) {
                return a.treeLevel - b.treeLevel;
            }
            if (a.content === "UNASSIGNED" && b.content !== "UNASSIGNED") return 1;
            if (a.content !== "UNASSIGNED" && b.content === "UNASSIGNED") return -1;
            if (a.content < b.content) return -1;
            if (a.content > b.content) return 1;
            return a.order - b.order;
        });
        groups.forEach((g, index) => (g.order = index + 1));
        return groups;
    }

    /**
     * Handle a click within the timeline.
     *
     * @param {Object} e
     * @private
     */
    on_timeline_click(e) {
        if (e.what === "group-label" && e.group !== -1) {
            this.props.onGroupClick(e);
        }
    }

    /**
     * Handle a double-click within the timeline.
     *
     * @param {Object} e
     * @private
     */
    on_timeline_double_click(e) {
        this.on_timeline_click(e);
        if (e.what === "item" && e.item !== -1) {
            this.props.onItemDoubleClick(e);
        }
    }

    /**
     * Trigger onUpdate.
     *
     * @param {Object} item
     * @private
     */
    on_update(item) {
        this.props.onUpdate(item);
    }

    /**
     * Trigger onMove.
     *
     * @param {Object} item
     * @param {Function} callback
     * @private
     */
    on_move(item, callback) {
        this.props.onMove(item, callback);
    }

    /**
     * Trigger onRemove.
     *
     * @param {Object} item
     * @param {Function} callback
     * @private
     */
    on_remove(item, callback) {
        this.props.onRemove(item, callback);
    }

    /**
     * Trigger onAdd.
     *
     * @param {Object} item
     * @param {Function} callback
     * @private
     */
    on_add(item, callback) {
        this.props.onAdd(item, callback);
    }
}

TimelineRenderer.template = "web_timeline.TimelineRenderer";
TimelineRenderer.props = {
    model: Object,
    onAdd: Function,
    onGroupClick: Function,
    onItemDoubleClick: Function,
    onMove: Function,
    onRemove: Function,
    onUpdate: Function,
};
