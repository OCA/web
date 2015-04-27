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

        get_perm: function(name){
            var self = this;
            var promise = self.permissions[name];
            if(!promise) {
                var defer = $.Deferred();
                new instance.web.Model(this.dataset.model)
                .call("check_access_rights", [name, false])
                .then(function (value) {
                    self.permissions[name] = value;
                    defer.resolve();
                });
                return defer;
            } else {
              return promise;
            }
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
            this.$el.find(".oe_timeline_button_today").click(self.on_today_clicked);
            this.$el.find(".oe_timeline_button_scale_day").click(self.on_scale_day_clicked);
            this.$el.find(".oe_timeline_button_scale_week").click(self.on_scale_week_clicked);
            this.$el.find(".oe_timeline_button_scale_month").click(self.on_scale_month_clicked);
            this.$el.find(".oe_timeline_button_scale_year").click(self.on_scale_year_clicked);
            this.current_window = {
                  start: new Date(),
                  end : new Date().addHours(24),
            }
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
            var init = function () {
                    self.init_timeline().then(function() {
                        $(window).trigger('resize');
                        self.trigger('timeline_view_loaded', fv);
                        self.ready.resolve();
                    });
                };
            
            var test = $.when(self.fields_get, self.get_perm('unlink'), self.get_perm('write'), self.get_perm('create'));
            return $.when(test).then(init);
        },

        init_timeline: function() {
            var self = this;
            var options = {
                groupOrder: self.group_order,
                editable: {
                    add: self.permissions['create'],         // add new items by double tapping
                    updateTime: self.permissions['write'],  // drag items horizontally
                    updateGroup: self.permissions['write'], // drag items from one group to another
                    remove: self.permissions['unlink'],       // delete an item by tapping the delete button top right
                },
                orientation: 'both',
                selectable: true,
                showCurrentTime: true,
                onAdd: self.on_add,
                onMove: self.on_move,
                onUpdate: self.on_update,
                onRemove: self.on_remove,
                orientation: 'both',
            };
            self.timeline = new vis.Timeline(self.$timeline.get(0));
            self.timeline.setOptions(options);
            return $.when();
        },

        group_order: function(grp1, grp2) {
            // display non grouped elements first
            if (grp1.id === -1){
                return -1;
            }
            if (grp2.id === -1){
                return +1;
            }
            return grp1.content - grp2.content;
            
        },

        /**
         * Transform OpenERP event object to timeline event object
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
            _.each(self.colors, function(color){
                if(eval("'" + evt[color.field] + "' " + color.opt + " '" + color.value + "'"))
                    self.color = color.color;
            });
            var r = {
                'start': date_start,
                'end': date_stop,
                'content': evt.__name,
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
            if (this.last_domains !== undefined){
                self.current_window = self.timeline.getWindow();
                return this.do_search(this.last_domains, this.last_contexts, this.last_group_bys);
            }
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
            groups.push({id:-1, content: _t('Undefined')})
            _.each(tasks, function(event) {
                data.push(self.event_data_transform(event));
            });
            _.each(self.groups, function(group){
                groups.push({id: group[0], content: group[1]});
            });
            this.timeline.setGroups(groups);
            this.timeline.setItems(data);
            this.timeline.setWindow(this.current_window);
            //this.timeline.moveTo(new Date(), true);
            //this.timeline.zoom(0.5, new Date());
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

        on_add: function(item, callback) {
            var self = this;
            var pop = new instance.web.form.SelectCreatePopup(this);
            pop.on("elements_selected", self, function(element_ids) {
                self.reload().then(function() {
                    self.timeline.focus(element_ids);
                });
            });
            context = {};
            context['default_'.concat(self.date_start)] = item.start;
            context['default_'.concat(self.last_group_bys[0])] = item.group;
            context['default_'.concat(self.date_stop)] = item.start.clone().addHours(this.date_delay || 1);
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

        on_update: function(item, callback) {
            var self = this;
            var id = item.evt.id;
            var title = item.evt.__name;
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
                var id_cast = parseInt(id).toString() == id ? parseInt(id) : id;
                var pop = new instance.web.form.FormOpenPopup(self);
                pop.on('write_completed', self, self.reload);
                pop.show_element(
                    self.dataset.model,
                    id_cast,
                    null,
                    {readonly: true, title: title}
                );
                //pop.on('closed', self, self.reload);
                var form_controller = pop.view_form;
                form_controller.on("load_record", self, function() {
                     var footer = pop.$el.closest(".modal").find(".modal-footer");
                     footer.find('.oe_form_button_edit,.oe_form_button_save').remove();
                     footer.find(".oe_form_button_cancel").prev().remove();
                     footer.find('.oe_form_button_cancel').before("<span> or </span>");
                     button_edit = _.str.sprintf("<button class='oe_button oe_form_button_edit oe_bold oe_highlight'><span> %s </span></button>",_t("Edit"));
                     button_save = _.str.sprintf("<button class='oe_button oe_form_button_save oe_bold oe_highlight'><span> %s </span></button>",_t("Save"));
                     footer.prepend(button_edit + button_save);
                     footer.find('.oe_form_button_save').hide();
                     footer.find('.oe_form_button_edit').on('click', function() {
                         form_controller.to_edit_mode();
                         footer.find('.oe_form_button_edit,.oe_form_button_save').toggle();
                     });
                     footer.find('.oe_form_button_save').on('click', function() {
                         form_controller.save();
                         form_controller.to_view_mode();
                         footer.find('.oe_form_button_edit,.oe_form_button_save').toggle();
                     });
                     var chatter = pop.$el.closest(".modal").find(".oe_chatter");
                     if(chatter.length){
                         var chatter_toggler = $($.parseHTML(_.str.sprintf('<div class="oe_chatter_toggle fa fa-plus-circle"><span> %s </span><div class="oe_chatter_content"></div></div>', _t("Messages"))));
                         chatter.before(chatter_toggler)
                         var chatter_content = chatter_toggler.find(".oe_chatter_content");
                         chatter_content.prepend(chatter); 
                         chatter_content.toggle();
                         chatter_toggler.click(function(){
                             chatter_content.toggle();
                             chatter_toggler.toggleClass('fa-plus-circle fa-minus-circle');
                         });
                     }
                });
            }
            return false;
        },

        on_move: function(item, callback) {
            var self = this;
            var start = item.start;
            var end = item.end;
            var group = false;
            if (item.group != -1) {
                group = item.group;
            }
            var data = {};
            data[self.fields_view.arch.attrs.date_start] =
                instance.web.auto_date_to_str(start, self.fields[self.fields_view.arch.attrs.date_start].type);
            data[self.fields_view.arch.attrs.date_stop] = 
                 instance.web.auto_date_to_str(end, self.fields[self.fields_view.arch.attrs.date_stop].type);
            data[self.fields_view.arch.attrs.default_group_by] = group; 
            var id = item.evt.id;
            this.dataset.write(id, data).then(function() {
                self.reload();
            });
        },

        on_remove: function(item, callback) {
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

        on_today_clicked: function(){
            this.current_window = {
                    start: new Date(),
                    end : new Date().addHours(24),
              }
            
          if (this.timeline){
              this.timeline.setWindow(this.current_window);
          }  
        },
        
        get_middel_date: function(start, end){
            //Get 1 hour in milliseconds
            var one_hour=1000*60*60;

            // Convert both dates to milliseconds
            var date1_ms = start.getTime();
            var date2_ms = end.getTime();

            // Calculate the difference in milliseconds
            var difference_ms = date2_ms - date1_ms;
                
            // Convert back to days and return
            nb_hours = Math.round(difference_ms/one_hour);
            return start.clone().addHours(nb_hours/2)
          },

          scale_current_window: function(factor){
              if (this.timeline){
                  this.current_window = this.timeline.getWindow();
                  this.current_window.end = this.current_window.start.clone().addHours(factor);
                  this.timeline.setWindow(this.current_window);
              }    
          },
          
          on_scale_day_clicked: function(){
              this.scale_current_window(24);
          },
          
          on_scale_week_clicked: function(){
              this.scale_current_window(24 * 7);
          },

          on_scale_month_clicked: function(){
              this.scale_current_window(24 * 30);
          },
          on_scale_year_clicked: function(){
              this.scale_current_window(24 * 365);
          },

    });
};
