/* global vis, py */
odoo.define("web_timeline.TimelineRenderer", function (require) {
    "use strict";

    const AbstractRenderer = require("web.AbstractRenderer");
    const core = require("web.core");
    const time = require("web.time");
    const utils = require("web.utils");
    const session = require("web.session");
    const QWeb = require("web.QWeb");
    const field_utils = require("web.field_utils");
    const TimelineCanvas = require("web_timeline.TimelineCanvas");

    const _t = core._t;

    const TimelineRenderer = AbstractRenderer.extend({
        template: "TimelineView",

        events: _.extend({}, AbstractRenderer.prototype.events, {
            "click .oe_timeline_button_today": "_onTodayClicked",
            "click .oe_timeline_button_scale_day": "_onScaleDayClicked",
            "click .oe_timeline_button_scale_week": "_onScaleWeekClicked",
            "click .oe_timeline_button_scale_month": "_onScaleMonthClicked",
            "click .oe_timeline_button_scale_year": "_onScaleYearClicked",
        }),

        init: function (parent, state, params) {
            this._super.apply(this, arguments);
            this.modelName = params.model;
            this.mode = params.mode;
            this.options = params.options;
            this.can_create = params.can_create;
            this.can_update = params.can_update;
            this.can_delete = params.can_delete;
            this.min_height = params.min_height;
            this.date_start = params.date_start;
            this.date_stop = params.date_stop;
            this.date_delay = params.date_delay;
            this.colors = params.colors;
            this.fieldNames = params.fieldNames;
            this.default_group_by = params.default_group_by;
            this.dependency_arrow = params.dependency_arrow;
            this.modelClass = params.view.model;
            this.fields = params.fields;

            this.timeline = false;
            this.initial_data_loaded = false;
        },

        /**
         * @override
         */
        start: function () {
            const attrs = this.arch.attrs;
            this.$el.addClass(attrs.class);
            this.$timeline = this.$(".oe_timeline_widget");

            if (!this.date_start) {
                throw new Error(
                    _t("Timeline view has not defined 'date_start' attribute.")
                );
            }
            this._super.apply(this, arguments);
        },

        /**
         * Triggered when the timeline is attached to the DOM.
         */
        on_attach_callback: function () {
            const height =
                this.$el.parent().height() - this.$(".oe_timeline_buttons").height();
            if (height > this.min_height && this.timeline) {
                this.timeline.setOptions({
                    height: height,
                });
            }
        },

        /**
         * @override
         */
        _render: function () {
            return Promise.resolve().then(() => {
                // Prevent Double Rendering on Updates
                if (!this.timeline) {
                    this.init_timeline();
                }
            });
        },

        /**
         * Set the timeline window to today (day).
         *
         * @private
         */
        _onTodayClicked: function () {
            if (this.timeline) {
                this.timeline.setWindow({
                    start: new moment(),
                    end: new moment().add(24, "hours"),
                });
            }
        },

        /**
         * Scale the timeline window to a day.
         *
         * @private
         */
        _onScaleDayClicked: function () {
            this._scaleCurrentWindow(() => 24);
        },

        /**
         * Scale the timeline window to a week.
         *
         * @private
         */
        _onScaleWeekClicked: function () {
            this._scaleCurrentWindow(() => 24 * 7);
        },

        /**
         * Scale the timeline window to a month.
         *
         * @private
         */
        _onScaleMonthClicked: function () {
            this._scaleCurrentWindow((start) => 24 * moment(start).daysInMonth());
        },

        /**
         * Scale the timeline window to a year.
         *
         * @private
         */
        _onScaleYearClicked: function () {
            this._scaleCurrentWindow(
                (start) => 24 * (moment(start).isLeapYear() ? 366 : 365)
            );
        },

        /**
         * Scales the timeline window based on the current window.
         *
         * @param {function} getHoursFromStart Function which returns the timespan
         * (in hours) the window must be scaled to, starting from the "start" moment.
         * @private
         */
        _scaleCurrentWindow: function (getHoursFromStart) {
            if (this.timeline) {
                const start = this.timeline.getWindow().start;
                const end = moment(start).add(getHoursFromStart(start), "hours");
                this.timeline.setWindow(start, end);
            }
        },

        /**
         * Computes the initial visible window.
         *
         * @private
         */
        _computeMode: function () {
            if (this.mode) {
                let start = false,
                    end = false;
                switch (this.mode) {
                    case "day":
                        start = new moment().startOf("day");
                        end = new moment().endOf("day");
                        break;
                    case "week":
                        start = new moment().startOf("week");
                        end = new moment().endOf("week");
                        break;
                    case "month":
                        start = new moment().startOf("month");
                        end = new moment().endOf("month");
                        break;
                }
                if (end && start) {
                    this.options.start = start;
                    this.options.end = end;
                } else {
                    this.mode = "fit";
                }
            }
        },

        /**
         * Initializes the timeline
         * (https://visjs.github.io/vis-timeline/docs/timeline).
         *
         * @private
         */
        init_timeline: function () {
            this._computeMode();
            this.options.editable = {};
            if (this.can_update && this.modelClass.data.rights.write) {
                this.options.onMove = this.on_move;
                this.options.onUpdate = this.on_update;
                // Drag items horizontally
                this.options.editable.updateTime = true;
                // Drag items from one group to another
                this.options.editable.updateGroup = true;
                if (this.can_create && this.modelClass.data.rights.create) {
                    this.options.onAdd = this.on_add;
                    // Add new items by double tapping
                    this.options.editable.add = true;
                }
            }
            if (this.can_delete && this.modelClass.data.rights.unlink) {
                this.options.onRemove = this.on_remove;
                // Delete an item by tapping the delete button top right
                this.options.editable.remove = true;
            }
            this.options.xss = {disabled: true};
            this.qweb = new QWeb(session.debug, {_s: session.origin}, false);
            if (this.arch.children.length) {
                const tmpl = utils.json_node_to_xml(
                    _.filter(this.arch.children, (item) => item.tag === "templates")[0]
                );
                this.qweb.add_template(tmpl);
            }

            this.timeline = new vis.Timeline(this.$timeline.get(0), {}, this.options);
            this.timeline.on("doubleClick", this.on_timeline_click);
            if (!this.options.onUpdate) {
                // In read-only mode, catch double-clicks this way.
                this.timeline.on("doubleClick", this.on_timeline_double_click);
            }
            const group_bys = this.arch.attrs.default_group_by.split(",");
            this.last_group_bys = group_bys;
            this.last_domains = this.modelClass.data.domain;
            this.$centerContainer = $(this.timeline.dom.centerContainer);
            this.canvas = new TimelineCanvas(this);
            this.canvas.appendTo(this.$centerContainer);
            this.timeline.on("changed", () => {
                this.load_initial_data();
                // Defer drawing until after DOM settles (e.g., after group collapse/expand)
                const draw = () => this.draw_canvas();
                if (typeof window !== "undefined" && window.requestAnimationFrame) {
                    window.requestAnimationFrame(draw);
                } else {
                    setTimeout(draw, 0);
                }
            });
        },

        /**
         * Clears and draws the canvas items.
         *
         * @private
         */
        draw_canvas: function () {
            this.canvas.clear();
            if (this.dependency_arrow) {
                this.draw_dependencies();
            }
        },

        /**
         * Draw item dependencies on canvas.
         *
         * @private
         */
        draw_dependencies: function () {
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
                    continue; // Skip items without data or event payload
                }
                const deps = data.evt[this.dependency_arrow];
                if (!Array.isArray(deps) || deps.length === 0) {
                    continue;
                }
                for (const id of deps) {
                    for (const k of keys) {
                        if (k.split("_")[0].toString() === id.toString()) {
                            const toItem = items[k];
                            this.draw_dependency(item, toItem);
                        }
                    }
                }
            }
        },

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
        draw_dependency: function (from, to, options) {
            // Skip if any item is missing, hidden, or its DOM node is not available/attached
            if (!from || !to) {
                return;
            }
            if (!from.displayed || !to.displayed) {
                return;
            }
            if (!from.dom || !to.dom || !from.dom.box || !to.dom.box) {
                return;
            }
            // In some cases after collapsing a group, items can be logically displayed
            // but their DOM nodes are detached. Guard against that situation.
            if (
                typeof document !== "undefined" &&
                (!document.body.contains(from.dom.box) ||
                    !document.body.contains(to.dom.box))
            ) {
                return;
            }
            const defaults = _.defaults({}, options, {
                line_color: "black",
                line_width: 1,
            });
            this.canvas.draw_arrow(
                from.dom.box,
                to.dom.box,
                defaults.line_color,
                defaults.line_width
            );
        },

        /* Load initial data. This is called once after each redraw; we only handle the first one.
         * Deferring this initial load here avoids rendering issues. */
        load_initial_data: function () {
            if (!this.initial_data_loaded) {
                this.on_data_loaded(this.modelClass.data.data, this.last_group_bys);
                this.initial_data_loaded = true;
                this.timeline.redraw();
            }
        },

        /**
         * Load display_name of records.
         *
         * @param {Object[]} events
         * @param {String[]} group_bys
         * @param {Boolean} adjust_window
         * @private
         * @returns {jQuery.Deferred}
         */
        on_data_loaded: function (events, group_bys, adjust_window) {
            const ids = _.pluck(events, "id");
            return this._rpc({
                model: this.modelName,
                method: "name_get",
                args: [ids],
                context: this.getSession().user_context,
            }).then(async (names) => {
                const nevents = _.map(events, (event) =>
                    _.extend(
                        {
                            __name: _.detect(names, (name) => name[0] === event.id)[1],
                        },
                        event
                    )
                );
                return this.on_data_loaded_2(nevents, group_bys, adjust_window);
            });
        },

        /**
         * Set groups and events.
         *
         * @param {Object[]} events
         * @param {String[]} group_bys
         * @param {Boolean} adjust_window
         * @private
         */
        on_data_loaded_2: function (events, group_bys, adjust_window) {
            const data = [];
            this.grouped_by = group_bys;
            for (const evt of events) {
                if (evt[this.date_start]) {
                    var transformed = this.event_data_transform(evt);
                    if (Array.isArray(transformed)) {
                        data.push(...transformed);
                    } else {
                        data.push(transformed);
                    }
                }
            }
            this.split_groups(events, group_bys).then((groups) => {
                // This.groups contains all unique group objects
                this.groups = groups;
                // Ensure relevant groups are visible
                for (const d of data) {
                    // D is a vis.js item, d.group is a single JSON string path
                    const itemGroupPathJson = d.group;
                    try {
                        // Parse the item's full group path
                        const itemPathSegments = JSON.parse(itemGroupPathJson);

                        // Iterate through all prefixes of this item's group path (e.g., [seg1], [seg1, seg2], ...)
                        for (let i = 0; i < itemPathSegments.length; i++) {
                            const subPathJson = JSON.stringify(
                                itemPathSegments.slice(0, i + 1)
                            );
                            // Find the actual group object corresponding to this sub-path
                            const group = groups.find((g) => g.id === subPathJson);
                            if (group && !group.visible) {
                                // If a group in the item's hierarchy was initially not visible (e.g., an "UNASSIGNED" group),
                                // make it visible because an item actually belongs to this path.
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
                const mode = !this.mode || this.mode === "fit";
                const adjust = _.isUndefined(adjust_window) || adjust_window;
                if (mode && adjust) {
                    this.timeline.fit();
                }
            });
        },

        /**
         * Get the groups.
         *
         * @param {Object[]} events
         * @param {String[]} group_bys
         * @private
         * @returns {Array}
         */
        split_groups: async function (events, group_bys) {
            if (group_bys.length === 0) {
                // No grouping, but vis.js expects groups if items have a 'group' property.
                // Create a single default group if items might have group properties.
                // However, event_data_transform might assign 'undefined-false' if no groups.
                // For safety, ensure at least one group if group_bys is empty but items might specify groups.
                // This case should ideally be handled by ensuring items don't have group props if no group_bys.
                // For now, returning an empty array, assuming items won't have group property.
                return [];
            }
            const groups = [];
            let seq = 1;

            const groupLevel = group_bys.reduce((acc, g, index) => {
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
                const names = await this._rpc({
                    model: model,
                    method: "name_get",
                    args: [ids],
                    context: this.getSession().user_context,
                });
                const result = names.map((name) => ({id: name[0], content: name[1]}));
                m2mNameCache[cacheKey] = result;
                return result;
            };

            const createGroup = (
                segmentObject,
                displayName,
                parentGroupsInput,
                lvl
            ) => {
                // SegmentObject is like {field: "partner_id", value: 35}
                // displayName is the human-readable name for this segment, e.g., "Azure Interior"
                const parentGroups =
                    parentGroupsInput && parentGroupsInput.length
                        ? parentGroupsInput
                        : [null];
                const createdGroups = [];

                for (const parent of parentGroups) {
                    let newPathSegments = [];
                    if (parent && parent.id) {
                        // Parent is a group object, parent.id is JSON string
                        try {
                            const parentPathSegments = JSON.parse(parent.id);
                            newPathSegments = [...parentPathSegments, segmentObject];
                        } catch (e) {
                            console.error(
                                "Error parsing parent group ID:",
                                parent.id,
                                e
                            );
                            // Fallback
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
                            // Do not set m2m fields for group_record_values as they are not single values for writing
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
                            // Ensure unique order
                            order: displayName === "UNASSIGNED" ? seq++ : seq++,
                            treeLevel: lvl,
                            // Default visibility
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
                // E.g. "partner_id" or "date_start:month"
                grouped_field_spec,
                // E.g. [3, "Azure Interior"] or "January 2024" or 3 (if just id) or [10,11] for m2m
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
                        // Vals is {id: ..., content: ...}
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
                    // Handling for date/datetime fields grouped by an operator (e.g., date_start:month)
                    // Odoo returns the formatted string (e.g., "January 2024") as the groupValue directly.
                } else if (
                    grouped_field_spec.includes(":") &&
                    (fieldInfo.type === "date" || fieldInfo.type === "datetime")
                ) {
                    const displayName = groupValue ? String(groupValue) : "UNASSIGNED";
                    // For date:operator groups, the `value` in the segment should be the formatted string itself,
                    // as this is what Odoo provides and what we need for display and potential re-grouping.
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
                    // Standard [id, name] for m2o, selection, etc.
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
                        const names = await getM2MNames(fieldInfo.relation, [
                            groupValue,
                        ]);
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

            for (const evt of events) {
                let currentParentGroups = [null];
                // Iterate using the full specifier, e.g., "date_start:month"
                for (const grouped_field_spec of group_bys) {
                    // Use the full specifier to get the value from the event
                    const groupValue = evt[grouped_field_spec];
                    const groupLvl = groupLevel[grouped_field_spec];
                    currentParentGroups = await processGroup(
                        grouped_field_spec,
                        groupValue,
                        groupLvl,
                        currentParentGroups
                    );
                    if (!currentParentGroups || currentParentGroups.length === 0) {
                        // Safety break if a level yields no groups
                        break;
                    }
                }
            }
            // Ensure unique group ordering, especially for UNASSIGNED or items with same name
            groups.sort((a, b) => {
                if (a.treeLevel !== b.treeLevel) {
                    return a.treeLevel - b.treeLevel;
                }
                if (a.content === "UNASSIGNED" && b.content !== "UNASSIGNED") return 1;
                if (a.content !== "UNASSIGNED" && b.content === "UNASSIGNED") return -1;
                if (a.content < b.content) return -1;
                if (a.content > b.content) return 1;
                // Fallback to sequence order
                return a.order - b.order;
            });
            // Re-assign order based on sorted list for vis.js if it uses it for display
            groups.forEach((g, index) => (g.order = index + 1));
            return groups;
        },

        get_m2m_grouping_datas: async function (groupModel, groupValue) {
            const groups = [{id: false, content: "UNASSIGNED"}];
            for (const gr of groupValue) {
                await this._rpc({
                    model: groupModel,
                    method: "name_get",
                    args: [gr],
                    context: this.getSession().user_context,
                }).then((name) => {
                    groups.push({id: name[0][0], content: name[0][1]});
                });
            }
            return groups;
        },

        /**
         * Get dates from given event
         *
         * @param {TransformEvent} evt
         * @returns {Object}
         */
        _get_event_dates: function (evt) {
            let date_start = new moment();
            let date_stop = null;

            const date_delay = evt[this.date_delay] || false,
                all_day = this.all_day ? evt[this.all_day] : false;

            if (all_day) {
                date_start = time.auto_str_to_date(
                    evt[this.date_start].split(" ")[0],
                    "start"
                );
                if (this.no_period) {
                    date_stop = date_start;
                } else {
                    date_stop = this.date_stop
                        ? time.auto_str_to_date(
                              evt[this.date_stop].split(" ")[0],
                              "stop"
                          )
                        : null;
                }
            } else {
                date_start = time.auto_str_to_date(evt[this.date_start]);
                date_stop = this.date_stop
                    ? time.auto_str_to_date(evt[this.date_stop])
                    : null;
            }

            if (!date_stop && date_delay) {
                date_stop = date_start.clone().add(date_delay, "hours").toDate();
            }

            return [date_start, date_stop];
        },

        /**
         * Transform Odoo event object to timeline event object.
         *
         * @param {TransformEvent} evt
         * @private
         * @returns {Object}
         */
        /* eslint-disable complexity */
        event_data_transform: function (evt) {
            const [date_start, date_stop] = this._get_event_dates(evt);

            let currentPaths = [[]];

            for (const grouped_field_spec of this.last_group_bys) {
                // E.g. "user_id", "date_start:month"
                const fieldValue = evt[grouped_field_spec];
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
                    // Handle date/datetime fields grouped by an operator (e.g., date_start:month)
                    // The fieldValue will be the formatted string (e.g., "January 2024")
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
                    // [id, name]
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

            for (const color of this.colors) {
                // Ensure evt[color.field] is not an array (e.g. m2o [id, name]) for py.eval
                let evalValue = evt[color.field];
                if (Array.isArray(evalValue)) {
                    // Use ID for evaluation
                    evalValue = evalValue[0];
                }
                try {
                    if (py.eval(`'${evalValue}' ${color.opt} '${color.value}'`)) {
                        this.color = color.color;
                    }
                } catch (e) {
                    console.warn("Error evaluating color expression:", e);
                }
            }

            let content = evt.__name || evt.display_name;
            if (this.arch.children.length) {
                content = this.render_timeline_item(evt);
            }

            const r_list = [];
            for (const jsonPathString of groupJSONStrings) {
                const r = {
                    start: date_start,
                    content: content,
                    // Unique ID for vis.js item
                    id: evt.id + "_" + jsonPathString,
                    record_id: evt.id,
                    // Keep original Odoo record order if available
                    order: evt.order,
                    // The group this specific vis.js item belongs to
                    group: jsonPathString,
                    // Keep original event data
                    evt: evt,
                    style: this.color ? `background-color: ${this.color};` : "",
                };
                if (date_stop && moment(date_start).isBefore(date_stop)) {
                    r.end = date_stop;
                }
                r_list.push(r);
            }
            // Reset color for next event
            this.color = null;

            return r_list.length === 1 ? r_list[0] : r_list;
        },

        /**
         * Render timeline item template.
         *
         * @param {Object} evt Record
         * @private
         * @returns {String} Rendered template
         */
        render_timeline_item: function (evt) {
            if (this.qweb.has_template("timeline-item")) {
                return this.qweb.render("timeline-item", {
                    record: evt,
                    field_utils: field_utils,
                });
            }

            console.error(
                _t('Template "timeline-item" not present in timeline view definition.')
            );
        },

        /**
         * Handle a click within the timeline.
         *
         * @param {ClickEvent} e
         * @private
         */
        on_timeline_click: function (e) {
            if (e.what === "group-label" && e.group !== -1) {
                this._trigger(
                    e,
                    () => {
                        // Do nothing
                    },
                    "onGroupClick"
                );
            }
        },

        /**
         * Handle a double-click within the timeline.
         *
         * @param {ClickEvent} e
         * @private
         */
        on_timeline_double_click: function (e) {
            this.on_timeline_click(e);
            if (e.what === "item" && e.item !== -1) {
                this._trigger(
                    e.item,
                    () => {
                        // No callback
                    },
                    "onItemDoubleClick"
                );
            }
        },

        /**
         * Trigger onUpdate.
         *
         * @param {Object} item
         * @param {Function} callback
         * @private
         */
        on_update: function (item, callback) {
            this._trigger(item, callback, "onUpdate");
        },

        /**
         * Trigger onMove.
         *
         * @param {Object} item
         * @param {Function} callback
         * @private
         */
        on_move: function (item, callback) {
            this._trigger(item, callback, "onMove");
        },

        /**
         * Trigger onRemove.
         *
         * @param {Object} item
         * @param {Function} callback
         * @private
         */
        on_remove: function (item, callback) {
            this._trigger(item, callback, "onRemove");
        },

        /**
         * Trigger onAdd.
         *
         * @param {Object} item
         * @param {Function} callback
         * @private
         */
        on_add: function (item, callback) {
            this._trigger(item, callback, "onAdd");
        },

        /**
         * Trigger_up encapsulation adds by default the renderer.
         *
         * @param {HTMLElement} item
         * @param {Function} callback
         * @param {String} trigger
         * @private
         */
        _trigger: function (item, callback, trigger) {
            this.trigger_up(trigger, {
                item: item,
                callback: callback,
                renderer: this,
            });
        },
    });

    return TimelineRenderer;
});
