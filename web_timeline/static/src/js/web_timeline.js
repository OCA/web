/* Odoo web_timeline
 * Copyright 2015 ACSONE SA/NV
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

/* global moment,vis,py */
/* eslint require-jsdoc:0 */
/* eslint no-alert:0 */
/* eslint no-eval:0 */

_.str.toBoolElse = function (str, elseValues, trueValues, falseValues) {
    'use strict';
    var ret = _.str.toBool(str, trueValues, falseValues);
    if (_.isUndefined(ret)) {
        return elseValues;
    }
    return ret;
};

openerp.web_timeline = function (instance) {
    'use strict';
    var Model = instance.web.Model;
    var str_to_datetime = instance.str_to_datetime;
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var moment = vis.moment;

    function isNullOrUndef (value) {
        return _.isUndefined(value) || _.isNull(value);
    }

    instance.web.views.add('timeline', 'instance.web_timeline.TimelineView');

    instance.web_timeline.TimelineView = instance.web.View.extend({
        template: "TimelineView",
        display_name: _lt('Timeline'),
        icon: 'fa-clock-o',
        quick_create_instance: instance.web_calendar.QuickCreate,

        init: function (parent, dataset, view_id, options) {
            this._super(parent);
            this.ready = $.Deferred();
            this.permissions = {};
            this.set_default_options(options);
            this.dataset = dataset;
            this.model = dataset.model;
            this.fields_view = {};
            this.view_id = view_id;
            this.view_type = 'timeline';
            this.color_map = {};
            this.range_start = null;
            this.range_stop = null;
            this.selected_filters = [];
            this.current_window = null;
        },

        get_perm: function (name) {
            var self = this;
            var promise = self.permissions[name];
            if (!promise) {
                var defer = $.Deferred();
                new Model(this.dataset.model)
                    .call("check_access_rights", [name, false])
                    .then(function (value) {
                        self.permissions[name] = value;
                        defer.resolve();
                    });
                return defer;
            }
            return promise;

        },

        set_default_options: function (options) {
            this._super(options);
            _.defaults(this.options, {
                confirm_on_delete: true,
            });
        },

        parse_colors: function () {
            if (this.fields_view.arch.attrs.colors) {
                this.colors = _(
                    this.fields_view.arch.attrs.colors.split(';')
                ).chain().compact().map(function (color_pair) {
                    var pair = color_pair.split(':'),
                        color = pair[0],
                        expr = pair[1],
                        temp = py.parse(py.tokenize(expr));
                    return {
                        'color': color,
                        'field': temp.expressions[0].value,
                        'opt': temp.operators[0],
                        'value': temp.expressions[1].value,
                    };
                }).value();
            }
        },

        view_loading: function (fv) {

            /* Xml view timeline options */
            var attrs = fv.arch.attrs;
            var self = this;
            this.fields_view = fv;
            this.parse_colors();
            this.$timeline = this.$el.find(".oe_timeline_widget");
            this.$el.find(
                ".oe_timeline_button_today"
            ).click($.proxy(this.on_today_clicked, this));
            this.$el.find(
                ".oe_timeline_button_scale_day"
            ).click($.proxy(this.on_scale_day_clicked, this));
            this.$el.find(
                ".oe_timeline_button_scale_week"
            ).click($.proxy(this.on_scale_week_clicked, this));
            this.$el.find(
                ".oe_timeline_button_scale_month"
            ).click($.proxy(this.on_scale_month_clicked, this));
            this.$el.find(
                ".oe_timeline_button_scale_year"
            ).click($.proxy(this.on_scale_year_clicked, this));
            this.current_window = {
                start: new moment(),
                end : new moment().add(24, 'hours'),
            };
            this.info_fields = [];

            if (!attrs.date_start) {
                throw new Error(_t(
                    "Timeline view has not defined 'date_start' attribute."
                ));
            }

            this.$el.addClass(attrs.class);

            this.name = fv.name || attrs.string;
            this.view_id = fv.view_id;

            this.mode = attrs.mode;
            this.date_start = attrs.date_start;
            this.date_stop = attrs.date_stop;

            if (!isNullOrUndef(attrs.quick_create_instance)) {
                self.quick_create_instance =
                    'instance.' + attrs.quick_create_instance;
            }

            // If this field is set ot true, we don't open the event in form
            // view, but in a popup with the view_id passed by this parameter
            if (
                isNullOrUndef(
                    attrs.event_open_popup
                ) || !_.str.toBoolElse(
                    attrs.event_open_popup, true
                )
            ) {
                this.open_popup_action = false;
            } else {
                this.open_popup_action = attrs.event_open_popup;
            }

            this.fields = fv.fields;

            for (var fld = 0; fld < fv.arch.children.length; fld++) {
                this.info_fields.push(fv.arch.children[fld].attrs.name);
            }

            new Model(this.dataset.model)
                .call('fields_get')
                .then(function (fields) {
                    self.fields = fields;
                });
            new Model(this.dataset.model)
                .call("check_access_rights", ["unlink", false])
                .then(function (unlink_right) {
                    self.unlink_right = unlink_right;
                });
            new Model(this.dataset.model)
                .call("check_access_rights", ["write", false])
                .then(function (write_right) {
                    self.write_right = write_right;

                });
            var init = function () {
                self.init_timeline().then(function () {
                    $(window).trigger('resize');
                    self.trigger('timeline_view_loaded', fv);
                    self.ready.resolve();
                });
            };

            return $.when(
                self.fields_get, self.get_perm('unlink'),
                self.get_perm('write'), self.get_perm('create')
            ).then(init);
        },

        init_timeline: function () {
            var self = this;
            var options = {
                groupOrder: self.group_order,
                editable: {
                    // Add new items by double tapping
                    add: self.permissions.create,
                    // Drag items horizontally
                    updateTime: self.permissions.write,
                    // Drag items from one group to another
                    updateGroup: self.permissions.write,
                    // Delete an item by tapping the delete button top right
                    remove: self.permissions.unlink,
                },
                orientation: 'both',
                selectable: true,
                showCurrentTime: true,
                onAdd: self.on_add,
                onMove: self.on_move,
                onUpdate: self.on_update,
                onRemove: self.on_remove,
            };

            self.timeline = new vis.Timeline(self.$timeline.empty().get(0));
            self.timeline.setOptions(options);
            if (self.mode && self['on_scale_' + self.mode + '_clicked']) {
                self['on_scale_' + self.mode + '_clicked']();
            }
            self.timeline.on('click', self.on_click);
            return $.when();
        },

        group_order: function (grp1, grp2) {
            // Display non grouped elements first
            if (grp1.id === -1) {
                return -1;
            }
            if (grp2.id === -1) {
                return +1;
            }
            return grp1.content - grp2.content;

        },

        /* Transform Odoo event object to timeline event object */
        event_data_transform: function (evt) {
            var self = this;
            var date_start = new moment();
            var date_stop = new moment();

            var date_delay = evt[this.date_delay] || 1.0,
                all_day = this.all_day ? evt[this.all_day] : false;

            if (all_day) {
                date_start = str_to_datetime(
                    evt[this.date_start].split(' ')[0], 'start'
                );
                date_stop = this.date_stop
                    ? str_to_datetime(
                        evt[this.date_stop].split(' ')[0], 'stop'
                    ) : null;
            } else {
                date_start = str_to_datetime(evt[this.date_start]);
                date_stop = this.date_stop ? str_to_datetime(
                    evt[this.date_stop]
                ) : null;
            }

            if (!date_start) {
                date_start = new moment();
            }
            if (!date_stop) {
                date_stop = moment(date_start).add(
                    date_delay, 'hours'
                ).toDate();
            }
            var group = evt[self.last_group_bys[0]];
            if (group) {
                group = _.first(group);
            } else {
                group = -1;
            }

            _.each(self.colors, function (color) {
                if (eval(
                    "'" + evt[color.field] + "' " + color.opt + " '" +
                    color.value + "'")
                ) {
                    self.color = color.color;
                }
            });
            var r = {
                'start': date_start,
                'end': date_stop,
                'content':
                    evt.__name === undefined
                        ? evt.display_name : evt.__name,
                'id': evt.id,
                'group': group,
                'evt': evt,
                'style': 'background-color: ' + self.color + ';',

            };
            self.color = undefined;
            return r;
        },

        do_search: function (domains, contexts, group_bys) {
            var self = this;
            self.last_domains = domains;
            self.last_contexts = contexts;
            // Select the group by
            var n_group_bys = [];
            if (this.fields_view.arch.attrs.default_group_by) {
                n_group_bys =
                    this.fields_view.arch.attrs.default_group_by.split(',');
            }
            if (group_bys.length) {
                n_group_bys = group_bys;
            }
            self.last_group_bys = n_group_bys;
            // Gather the fields to get
            var fields = _.compact(_.map(
                ["date_start", "date_delay", "date_stop", "progress"],
                function (key) {
                    return self.fields_view.arch.attrs[key] || '';
                }
            ));

            fields.push(this.fields_view.arch.attrs.name);
            fields = _.uniq(fields.concat(
                _.pluck(this.colors, "field").concat(n_group_bys)
            ));

            return $.when(this.has_been_loaded).then(function () {
                return self.dataset.read_slice(fields, {
                    domain: domains,
                    context: contexts,
                }).then(function (data) {
                    return self.on_data_loaded(data, n_group_bys);
                });
            });
        },

        reload: function () {
            var self = this;
            if (this.last_domains !== undefined) {
                self.current_window = self.timeline.getWindow();
                return this.do_search(
                    this.last_domains, this.last_contexts, this.last_group_bys
                );
            }
        },

        on_data_loaded: function (events, group_bys) {
            var self = this;
            var ids = _.pluck(events, "id");
            return this.dataset.name_get(ids).then(function (names) {
                var nevents = _.map(events, function (event) {
                    return _.extend({__name: _.detect(names, function (name) {
                        return name[0] === event.id;
                    })[1]}, event);
                });
                return self.on_data_loaded_2(nevents, group_bys);
            });
        },
        on_data_loaded_2: function (events, group_bys) {
            var self = this;
            var data = [];
            _.each(events, function (event) {
                if (event[self.date_start]) {
                    var item = self.event_data_transform(event);
                    item.content = event.timeline_name;
                    data.push(item);
                }
            });
            // Get the groups
            var split_groups = function (_events, _group_bys) {
                if (_group_bys.length === 0) {
                    return _events;
                }
                var _groups = [];
                _groups.push({id:-1, content: _t('-')});
                _.each(_events, function (event) {
                    var group_name = event[_.first(_group_bys)];
                    if (group_name) {
                        var group = _.find(_groups, function (_group) {
                            return _.isEqual(_group.id, group_name[0]);
                        });
                        if (group === undefined) {
                            group = {id: group_name[0], content: group_name[1]};
                            _groups.push(group);
                        }
                    }
                });
                return _groups;
            };
            var groups = split_groups(events, group_bys);
            this.timeline.setGroups(groups);
            this.timeline.setItems(data);
            this.timeline.fit();
        },

        do_show: function () {
            this.do_push_state({});
            return this._super();
        },

        is_action_enabled: function (action) {
            if (action === 'create' && !this.options.creatable) {
                return false;
            }
            return this._super(action);
        },

        create_completed: function (id) {
            var self = this;
            this.dataset.ids = this.dataset.ids.concat([id]);
            this.dataset.trigger("dataset_changed", id);
            this.dataset.read_ids([id], this.fields).done(function (records) {
                var new_event = self.event_data_transform(records[0]);
                var items = self.timeline.itemsData;
                items.add(new_event);
                self.timeline.setItems(items);
            });
        },

        on_add: function (item) {
            var self = this,
                pop = new instance.web.form.SelectCreatePopup(this),
                context = this.get_popup_context(item);
            pop.on("elements_selected", self, function (element_ids) {
                self.reload().then(function () {
                    self.timeline.focus(element_ids);
                });
            });
            pop.select_element(
                self.dataset.model,
                {
                    title: _t("Create"),
                    initial_view: "form",
                },
                null,
                context
            );
        },

        get_popup_context: function (item) {
            var context = {};
            context['default_'.concat(this.date_start)] = item.start;
            context['default_'.concat(this.date_stop)] = item.start.clone()
                .addHours(this.date_delay || 1);
            if (item.group !== -1) {
                context['default_'.concat(this.last_group_bys[0])] = item.group;
            }
            return context;

        },

        on_update: function (item) {
            var self = this;
            var id = item.evt.id;
            var title = item.evt.__name;
            if (this.open_popup_action) {
                var id_cast =
                    parseInt(id, 10).toString() === id
                        ? parseInt(id, 10) : id;
                var pop = new instance.web.form.FormOpenPopup(self);
                pop.on('write_completed', self, self.reload);
                pop.show_element(
                    self.dataset.model,
                    id_cast,
                    null,
                    {readonly: true, title: title}
                );
                var form_controller = pop.view_form;
                form_controller.on("load_record", self, function () {
                    var footer = pop.$el.closest(".modal").find(
                        ".modal-footer"
                    );
                    footer.find(
                        '.oe_form_button_edit,.oe_form_button_save'
                    ).remove();
                    footer.find(".oe_form_button_cancel").prev().remove();
                    footer.find('.oe_form_button_cancel').before(
                        "<span> or </span>"
                    );
                    var button_edit = _.str.sprintf(
                        "<button class='oe_button oe_form_button_edit " +
                        "oe_bold oe_highlight'><span> %s </span></button>",
                        _t("Edit")
                    );
                    var button_save = _.str.sprintf(
                        "<button class='oe_button " +
                        "oe_form_button_save oe_bold oe_highlight'>" +
                        "<span> %s </span></button>", _t("Save")
                    );
                    footer.prepend(button_edit + button_save);
                    footer.find('.oe_form_button_save').hide();
                    footer.find('.oe_form_button_edit').on(
                        'click',
                        function () {
                            form_controller.to_edit_mode();
                            footer.find(
                                '.oe_form_button_edit,.oe_form_button_save'
                            ).toggle();
                        }
                    );
                    footer.find('.oe_form_button_save').on(
                        'click',
                        function () {
                            form_controller.save();
                            form_controller.to_view_mode();
                            footer.find(
                                '.oe_form_button_edit,.oe_form_button_save'
                            ).toggle();
                        }
                    );
                    var chatter = pop.$el.closest(".modal").find(
                        ".oe_chatter"
                    );
                    if (chatter.length) {
                        var chatter_toggler = $($.parseHTML(_.str.sprintf(
                            '<div class="oe_chatter_toggle fa ' +
                            'fa-plus-circle">' +
                            '<span> %s </span>' +
                            '<div class="oe_chatter_content"></div>' +
                        '</div>', _t("Messages"))));
                        chatter.before(chatter_toggler);
                        var chatter_content = chatter_toggler.find(
                            ".oe_chatter_content"
                        );
                        chatter_content.prepend(chatter);
                        chatter_content.toggle();
                        chatter_toggler.click(function () {
                            chatter_content.toggle();
                            chatter_toggler.toggleClass(
                                'fa-plus-circle fa-minus-circle'
                            );
                        });
                    }
                });
            } else {
                var index = this.dataset.get_id_index(id);
                this.dataset.index = index;
                if (this.write_right) {
                    this.do_switch_view('form', null, {mode: "edit"});
                } else {
                    this.do_switch_view('form', null, {mode: "view"});
                }
            }
            return false;
        },

        on_move: function (item) {
            var self = this;
            var start = new moment(item.start);
            var end = new moment(item.end);
            var group = false;
            if (item.group !== -1) {
                group = item.group;
            }
            var data = {};

            data[self.fields_view.arch.attrs.date_start] =
                str_to_datetime(start.utc().format('YYYY-MM-DD hh:mm:ss'),
                    self.fields[self.fields_view.arch.attrs.date_start].type);

            data[self.fields_view.arch.attrs.date_stop] =
                str_to_datetime(end.utc().format('YYYY-MM-DD hh:mm:ss'),
                    self.fields[self.fields_view.arch.attrs.date_stop].type);

            data[self.fields_view.arch.attrs.default_group_by] = group;
            var id = item.evt.id;
            this.dataset.write(id, data);
        },

        on_remove: function (item, callback) {
            var self = this;
            function do_it () {
                return $.when(self.dataset.unlink([item.evt.id])).then(
                    function () {
                        callback(item);
                    }
                );
            }
            if (this.options.confirm_on_delete) {
                if (confirm(_t(
                    "Are you sure you want to delete this record ?"
                ))) {
                    return do_it();
                }
            } else {
                return do_it();
            }
        },

        on_click: function (e) {
            // Handle a click on a group header
            if (e.what === 'group-label') {
                return this.on_group_click(e);
            }
        },
        on_group_click: function (e) {
            if (e.group === -1) {
                return;
            }
            return this.do_action({
                type: 'ir.actions.act_window',
                res_model: this.fields[this.last_group_bys[0]].relation,
                res_id: e.group,
                target: 'new',
                views: [[false, 'form']],
            });
        },

        scale_current_window: function (factor) {
            if (this.timeline) {
                this.current_window = this.timeline.getWindow();
                this.current_window.end = moment(
                    this.current_window.start
                ).add(factor, 'hours');
                this.timeline.setWindow(this.current_window);
            }
        },

        on_today_clicked: function () {
            this.current_window = {
                start: new moment(),
                end : new moment().add(24, 'hours'),
            };

            if (this.timeline) {
                this.timeline.setWindow(this.current_window);
            }
        },

        on_scale_day_clicked: function () {
            this.scale_current_window(24);
        },

        on_scale_week_clicked: function () {
            this.scale_current_window(24 * 7);
        },

        on_scale_month_clicked: function () {
            this.scale_current_window(24 * 30);
        },

        on_scale_year_clicked: function () {
            this.scale_current_window(24 * 365);
        },
    });
};
