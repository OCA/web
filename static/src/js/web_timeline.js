/*---------------------------------------------------------
 * OpenERP web_timeline
 *---------------------------------------------------------*/

_.str.toBoolElse = function (str, elseValues, trueValues, falseValues) {
    var ret = _.str.toBool(str, trueValues, falseValues);
    if (_.isUndefined(ret)) {
        return elseValues;
    }
    return ret;
};

openerp.web_timeline = function(instance) {
    var _t = instance.web._t,
        _lt = instance.web._lt,
        QWeb = instance.web.qweb;

    function isNullOrUndef(value) {
        return _.isUndefined(value) || _.isNull(value);
    }

    instance.web.views.add('timeline', 'instance.web_timeline.TimelineView');

    instance.web_timeline.TimelineView = instance.web.View.extend({
        template: "TimelineView",
        display_name: _lt('Timeline'),
        quick_create_instance: 'instance.web_timeline.QuickCreate',

        init: function (parent, dataset, view_id, options) {
            this._super(parent);
            this.ready = $.Deferred();
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
            this.group_by_name = {};
        },

        set_default_options: function(options) {
            this._super(options);
            _.defaults(this.options, {
                confirm_on_delete: true
            });
        },

        parse_colors: function(){
            if(this.fields_view.arch.attrs.colors) {
                this.colors = _(this.fields_view.arch.attrs.colors.split(';')).chain().compact().map(function(color_pair) {
                    var pair = color_pair.split(':'), color = pair[0], expr = pair[1];
                    var temp = py.parse(py.tokenize(expr));
                    return {'color': color, 'field': temp.expressions[0].value, 'opt': temp.operators[0], 'value': temp.expressions[1].value};
                }).value();
            }
        },

        view_loading: function (fv) {
            /* xml view timeline options */
            var attrs = fv.arch.attrs;
            var self = this;
            this.fields_view = fv;
            this.parse_colors();
            this.$timeline = this.$el.find(".oe_timeline_widget");

            this.info_fields = [];

            if (!attrs.date_start) {
                throw new Error(_t("Timeline view has not defined 'date_start' attribute."));
            }

            this.$el.addClass(attrs['class']);

            this.name = fv.name || attrs.string;
            this.view_id = fv.view_id;

            this.mode = attrs.mode;                 // one of month, week or day
            this.date_start = attrs.date_start;     // Field name of starting
                                                    // date field
            this.date_stop = attrs.date_stop;
            
            if (!isNullOrUndef(attrs.quick_create_instance)) {
                self.quick_create_instance = 'instance.' + attrs.quick_create_instance;
            }

                       // If this field is set ot true, we don't open the event in form
            // view, but in a popup with the view_id passed by this parameter
            if (isNullOrUndef(attrs.event_open_popup) || !_.str.toBoolElse(attrs.event_open_popup, true)) {
                this.open_popup_action = false;
            } else {
                this.open_popup_action = attrs.event_open_popup;
            }
            
            this.fields = fv.fields;

            for (var fld = 0; fld < fv.arch.children.length; fld++) {
                this.info_fields.push(fv.arch.children[fld].attrs.name);
            }

            var fields_get = new instance.web.Model(this.dataset.model)
            .call('fields_get')
            .then(function (fields) {
                self.fields = fields;
            });
            var unlink_check = new instance.web.Model(this.dataset.model)
            .call("check_access_rights", ["unlink", false])
            .then(function (unlink_right) {
                self.unlink_right = unlink_right;
            });
            var edit_check = new instance.web.Model(this.dataset.model)
                .call("check_access_rights", ["write", false])
                .then(function (write_right) {
                    self.write_right = write_right;
                    
                });
            var init = new instance.web.Model(this.dataset.model)
                .call("check_access_rights", ["create", false])
                .then(function (create_right) {
                    self.create_right = create_right;
                    self.init_timeline().then(function() {
                        $(window).trigger('resize');
                        self.trigger('timeline_view_loaded', fv);
                        self.ready.resolve();
                    });
                });
            return $.when(fields_get.then(unlink_check).then(edit_check).then(init));
        },

        init_timeline: function() {
            var self = this;
            var options = {
                groupOrder: 'content',
                editable: {
                    add: self.write_right,         // add new items by double tapping
                    updateTime: self.write_right,  // drag items horizontally
                    updateGroup: self.write_right, // drag items from one group to another
                    remove: self.unlink_right,       // delete an item by tapping the delete button top right
                },
                selectable: true,
                showCurrentTime: true,
                start: new Date(),
                
                onAdd: function (item, callback) {
                    self.on_task_create(item);
                },

                onMove: function (item, callback) {
                    self.on_item_changed(item);
                    callback(item); // send back adjusted item
                },

                onUpdate: function (item, callback) {
                  self.on_item_changed(item);
                  callback(item); // send back adjusted item
                },

                onRemove: function (item, callback) {
                  self.remove_event(item, callback);
                },
            };
            self.timeline = new vis.Timeline(self.$timeline.get(0));
            self.timeline.setOptions(options);
            return $.when();
        },

        on_task_create: function(item) {
            var self = this;
            var pop = new instance.web.form.SelectCreatePopup(this);
            pop.on("elements_selected", self, function() {
                self.reload();
            });
            context = {};
            context['default_'.concat(self.date_start)] = item.start;
            context['default_'.concat(self.last_group_bys[0])] = item.group;
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
        register_events: function(){
            var self = this;
            var options = {
                            };
            self.timeline.setOptions(options);
            self.timeline.on('edit', function() {
                var sel = self.timeline.getSelection();
                if (sel.length) {
                  if (sel[0].row != undefined) {
                    var row = sel[0].row;
                    self.open_event(row);
                  }
               }
            });
            self.timeline.on('delete', function() {
                if(! self.unlink_right){
                    self.timeline.cancelDelete();
                    alert(_t("You are not allowed to delete this event ?"));
                }
                var sel = self.timeline.getSelection();
                if (sel.length) {
                  if (sel[0].row != undefined) {
                    var row = sel[0].row;
                    self.remove_event(self.timeline.getItem(row), undefined);
                  }
               }
            });
            self.timeline.on('changed', function() {
               var sel = self.timeline.getSelection();
                if (sel.length) {
                  if (sel[0].row != undefined) {
                    var row = sel[0].row;
                    self.on_item_changed(self.timeline.getItem(row));
                  }
               }
            });
        },

          
        /**
         * Transform OpenERP event object to fulltimeline event object
         */
        event_data_transform: function(evt) {
            var self = this;

            var date_delay = evt[this.date_delay] || 1.0,
                all_day = this.all_day ? evt[this.all_day] : false,
                res_computed_text = '',
                the_title = '',
                attendees = [];

            if (!all_day) {
                date_start = instance.web.auto_str_to_date(evt[this.date_start]);
                date_stop = this.date_stop ? instance.web.auto_str_to_date(evt[this.date_stop]) : null;
            }
            else {
                date_start = instance.web.auto_str_to_date(evt[this.date_start].split(' ')[0],'start');
                date_stop = this.date_stop ? instance.web.auto_str_to_date(evt[this.date_stop].split(' ')[0],'stop') : null; 
            }
            
            if (!date_start){
                    date_start = new Date();
            }
            if(!date_stop) {
                date_stop = date_start.clone().addHours(date_delay);
            }
            var group = evt[self.last_group_bys[0]];
            if (group){
                    group = _.first(group);
            } else {
                    group = -1;
            }
            var r = {
                'start': date_start,
                'end': date_stop,
                'content': evt.__name,
                'id': evt.id,
                'group': group,
                'evt': evt,
                
            };
            if (!self.useContacts || self.all_filters[evt[this.color_field]] !== undefined) {
                if (this.color_field && evt[this.color_field]) {
                    var color_key = evt[this.color_field];
                    if (typeof color_key === "object") {
                        color_key = color_key[0];
                    }
                    r.className = 'cal_opacity timeline_color_'+ this.get_color(color_key);
                }
            }
            else  { // if form all, get color -1
                  r.className = 'cal_opacity timeline_color_'+ self.all_filters[-1].color;
            }
            return r;
        },
        

        do_search: function (domains, contexts, group_bys) {
            var self = this;
            self.last_domains = domains;
            self.last_contexts = contexts;
            // self.reload_gantt();
            // select the group by
            var n_group_bys = [];
            if (this.fields_view.arch.attrs.default_group_by) {
                n_group_bys = this.fields_view.arch.attrs.default_group_by.split(',');
            }
            if (group_bys.length) {
                n_group_bys = group_bys;
            }
            self.last_group_bys = n_group_bys;
            // gather the fields to get
            var fields = _.compact(_.map(["date_start", "date_delay", "date_stop", "progress"], function(key) {
                return self.fields_view.arch.attrs[key] || '';
            }));

            fields = _.uniq(fields.concat(_.pluck(this.colors, "field").concat(n_group_bys)));
            var group_by = self.fields[_.first(n_group_bys)]
            var read_groups = new instance.web.DataSet(this, group_by.relation, group_by.context)
                .name_search('', group_by.domain)
                .then(function(groups){
                    self.groups = groups;
                });

            return $.when(this.has_been_loaded, read_groups).then(function() {
                return self.dataset.read_slice(fields, {
                    domain: domains,
                    context: contexts
                }).then(function(data) {
                    return self.on_data_loaded(data, n_group_bys);
                });
            });
        },

        
        reload: function() {
            var self = this;
            if (this.last_domains !== undefined)
                return this.do_search(this.last_domains, this.last_contexts, this.last_group_bys);
        },

        on_data_loaded: function(tasks, group_bys) {
            var self = this;
            var ids = _.pluck(tasks, "id");
            return this.dataset.name_get(ids).then(function(names) {
                var ntasks = _.map(tasks, function(task) {
                    return _.extend({__name: _.detect(names, function(name) { return name[0] == task.id; })[1]}, task); 
                });
                return self.on_data_loaded_2(ntasks, group_bys);
            });
        },

        on_data_loaded_2: function(tasks, group_bys) {
            var self = this;
            var data = [];
            var groups = [];
            groups.push({id:-1, content:'undefined'})
            self.group_by_name = {};
            _.each(tasks, function(event) {
                data.push(self.event_data_transform(event));
            });
            _.each(self.groups, function(group){
                groups.push({id: group[0], content: group[1]});
            });
            this.timeline.setGroups(groups);
            this.timeline.setItems(data);
            this.timeline.moveTo(new Date(), true);
            //this.timeline.zoom(0.5, new Date());
        },
            
        set_records: function(events){
            var self = this;
            var data = [];
            _.each(events, function(event) {
                this.push(this.event_data_transform(event));
            });
            this.timeline.draw(data);   
        },

        open_event: function(index) {
            var self = this;
            var item = self.timeline.getItem(index);
            var id = item.evt.id;
            var title = item.evt.__name;
            var index = index;
            if (! this.open_popup_action) {
                var index = this.dataset.get_id_index(id);
                this.dataset.index = index;
                if (this.write_right) {
                    this.do_switch_view('form', null, { mode: "edit" });
                } else {
                    this.do_switch_view('form', null, { mode: "view" });
                }
            }
            else {
                var pop = new instance.web.form.FormOpenPopup(this);
                var id_cast = parseInt(id).toString() == id ? parseInt(id) : id;
                pop.show_element(this.dataset.model, id_cast, this.dataset.get_context(), {
                    title: _.str.sprintf(_t("View: %s"),title),
                    view_id: +this.open_popup_action,
                    res_id: id_cast,
                    target: 'new',
                    readonly:true
                });

               var form_controller = pop.view_form;
               form_controller.on("load_record", self, function(){
                    button_edit = _.str.sprintf("<button class='oe_button oe_bold editme oe_highlight'><span> %s </span></button>",_t("Edit Event"));
                    
                    pop.$el.closest(".modal").find(".modal-footer").prepend(button_delete);
                    pop.$el.closest(".modal").find(".modal-footer").prepend(button_edit);
                    
                    $('.editme').click(
                        function() {
                            $('.oe_form_button_cancel').trigger('click');
                            self.dataset.index = self.dataset.get_id_index(id);
                            self.do_switch_view('form', null, { mode: "edit" });
                        }
                    );
               });
            }
            return false;
        },

        do_show: function() {
            this.do_push_state({});
            return this._super();
        },

        is_action_enabled: function(action) {
            if (action === 'create' && !this.options.creatable) {
                return false;
            }
            return this._super(action);
        },

        on_item_changed: function(item) {
            var self = this;
            var start = item.start;
            var end = item.end;
            var group = false;
            if (item.group) {
                group = item.group;
            }
            var data = {};
           data[self.fields_view.arch.attrs.date_start] =
               instance.web.auto_date_to_str(start, self.fields[self.fields_view.arch.attrs.date_start].type);
           data[self.fields_view.arch.attrs.date_stop] = 
                instance.web.auto_date_to_str(end, self.fields[self.fields_view.arch.attrs.date_stop].type);
           data[self.fields_view.arch.attrs.default_group_by] = group; 
           var id = item.evt.id;
           this.dataset.write(id, data);
        },

        /**
         * Handles a newly created record
         * 
         * @param {id} id of the newly created record
         */
        quick_created: function (id) {

            /**
             * Note: it's of the most utter importance NOT to use inplace
             * modification on this.dataset.ids as reference to this data is
             * spread out everywhere in the various widget. Some of these
             * reference includes values that should trigger action upon
             * modification.
             */
            this.dataset.ids = this.dataset.ids.concat([id]);
            this.dataset.trigger("dataset_changed", id);
            this.refresh_event(id);
        },

        remove_event: function(item, callback) {
            var self = this;
            function do_it() {
                return $.when(self.dataset.unlink([item.evt.id])).then(function() {
                    callback(item);
                });
            }
            if (this.options.confirm_on_delete) {
                if (confirm(_t("Are you sure you want to delete this record ?"))) {
                    return do_it();
                }
            } else
                return do_it();
        },
    });
};
