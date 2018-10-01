// Copyright (c) 2015 Noviat nv/sa (www.noviat.com)

openerp.web_tree_date_search = function(instance) {
    var _t = instance.web._t,
       _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.ListView.include({
        init: function(parent, dataset, view_id, options) {
            this._super.apply(this, arguments);
            if ("dates_filter" in dataset.context){
                this.dates_filter = dataset.context["dates_filter"];
                this.current_date_from  = [];
                this.current_date_to  = [];
            }
            this.tree_date_search_loaded = false;
        },
        do_load_state: function(state, warm) {
            var ui_toolbar_loc = $('.ui-toolbar:last');
            if (this.dates_filter && this.dates_filter.length > 0){
                ui_toolbar_loc.show();
            }
            else{
                if (ui_toolbar_loc.children().length == 0)
                    ui_toolbar_loc.hide();
            }
            return this._super.apply(this, arguments);
        },
        load_list: function(data) {
            var self = this;
            var ret = this._super.apply(this, arguments);

            // dont run if already loaded
            if (this.tree_date_search_loaded)
                return ret;

            this.date_field_data = [];
            for (i in this.dates_filter) {
                var date_field = this.dates_filter[i];
                for (col in this.columns){
                    if (this.columns[col].name == date_field){
                        this.date_field_data[date_field] = [
                            this.columns[col].string,
                            this.columns[col].type
                        ]
                        break;
                    }
                }
            }

            var custom_filters = instance.web.search.custom_filters;
            var INPUT_SELECTOR = ' .oe_datepicker_master';
            if (this.dates_filter && this.dates_filter.length > 0) {
                this.$el.parent().prepend(QWeb.render(
                    'web_tree_date_search_toolbar', {widget: this}));
                var ui_toolbar_loc = $('.ui-toolbar:last');
                ui_toolbar_loc.show();
                for (i in this.dates_filter) {
                    var date_field = this.dates_filter[i];
                    var date_string = this.date_field_data[date_field][0];
                    var date_type = this.date_field_data[date_field][1];

                    // add search form to toolbar
                    var date_div = QWeb.render('web_tree_date_search_field', {
                        'field_name': date_string
                    });
                    var toolbar_height = ui_toolbar_loc.height();
                    ui_toolbar_loc.append(date_div);

                    // assign classes to 'from' and 'to' spans
                    var from_class = 'oe_date_filter_from_' + date_field,
                        to_class = 'oe_date_filter_to_' + date_field,
                        from_selector = '.' + from_class + ':last',
                        to_selector = '.' + to_class + ':last',
                        spans = $('div.oe_form_dropdown_section:last span');
                    spans.eq(0).addClass(from_class);
                    spans.eq(1).addClass(to_class);

                    // add date input elements to each
                    function add_input_element(_class, selector) {
                        var value = new (custom_filters.get_object(date_type))(
                            this, {
                                "selectable": true,
                                "name": _class,
                                "type": date_type,
                                "string": date_string
                            }
                        );
                        var value_loc = $(selector).show().empty();
                        value.appendTo(value_loc);
                        return value;
                    }
                    this.value = add_input_element(from_class, from_selector);
                    this.value = add_input_element(to_class, to_selector);

                    // sizing of the input elements
                    var input_from = $(from_selector + INPUT_SELECTOR);
                    var input_to = $(to_selector + INPUT_SELECTOR);
                    if (date_type == 'date') {
                        input_from.addClass('web_tree_date_search_input_date');
                        input_to.addClass('web_tree_date_search_input_date');
                    }
                    input_from.addClass('web_tree_date_search_input');
                    input_to.addClass('web_tree_date_search_input');
                    // In 2 line to fit with account move line tree view
                    if (toolbar_height < 40) {
                        var $elem1 = input_from.parent()
                            .parent().parent().parent().parent();
                        var $elem = $elem1.find("h4");
                        $elem.css("display", "inline");
                    }
                    input_from.attr("placeholder", _t("From"));
                    input_to.attr("placeholder", _t("To"));

                    // on_change functions
                    input_from.change(function() {
                        var elem = this.parentElement.
                            parentElement.parentElement.className;
                        var res = elem.split("oe_date_filter_from_");
                        self.current_date_from[res[1]] =
                            this.value === '' ? null : this.value;
                        if (self.current_date_from[res[1]]){
                            self.current_date_from[res[1]] =
                                instance.web.parse_value(
                                    self.current_date_from[res[1]],
                                    {"widget": date_type}
                                );
                        }
                        self.do_search(
                            self.last_domain,
                            self.last_context,
                            self.last_group_by
                        );
                    });
                    input_to.change(function() {
                        var elem = this.parentElement.
                            parentElement.parentElement.className;
                        var res = elem.split("oe_date_filter_to_");
                        self.current_date_to[res[1]] =
                            this.value === '' ? null : this.value;
                        if (self.current_date_to[res[1]]){
                            self.current_date_to[res[1]] =
                                instance.web.parse_value(
                                    self.current_date_to[res[1]],
                                    {"widget": date_type}
                                );
                        }
                        self.do_search(
                            self.last_domain,
                            self.last_context,
                            self.last_group_by
                        );
                    });
                    this.on('edit:after', this, function() {
                        input_from.attr('disabled', 'disabled');
                        input_to.attr('disabled', 'disabled');
                    });
                    this.on('save:after cancel:after', this, function() {
                        input_from.removeAttr('disabled');
                        input_to.removeAttr('disabled');
                    });
                }
            }
            else {
                // Only hide current if it's empty
                // Work from tree view to tree view with or without date_filters
                // Work from tree view to wizard with or without date_filters
                var ui_toolbar_loc = $('.ui-toolbar:last');
                if (ui_toolbar_loc.children().length == 0)
                    ui_toolbar_loc.hide();
            }
            this.tree_date_search_loaded = true;
            return ret;
        },
        do_search: function(domain, context, group_by) {
            this.last_domain = domain;
            this.last_context = context;
            this.last_group_by = group_by;
            domain = this.get_dates_filter_domain(domain);
            return this._super(domain, context, group_by);
        },
        get_dates_filter_domain: function(last_domain) {
            var domain = [];
            for (from in this.current_date_from){
                if (this.current_date_from[from])
                    domain.push([from, '>=', this.current_date_from[from]]);
            }
            for (to in this.current_date_to){
                if (this.current_date_to[to])
                    domain.push([to, '<=', this.current_date_to[to]]);
            }
            return new instance.web.CompoundDomain(last_domain, domain);
        },
    });

};
