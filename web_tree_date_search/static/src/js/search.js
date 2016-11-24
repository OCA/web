//  @@@ web_tree_date_search custom JS @@@
// #############################################################################
//
//    Copyright (c) 2015 Noviat nv/sa (www.noviat.com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published
//    by the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// #############################################################################


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
                if (ui_toolbar_loc.children().length === 0)
                    ui_toolbar_loc.hide();
            }
            return this._super.apply(this, arguments);
        },
        load_list: function(data) {
            var self = this;
            var tmp = this._super.apply(this, arguments);
            var date_field = false;
            if (!this.tree_date_search_loaded){
                this.date_field_data = {};
                for (var i in this.dates_filter){
                    date_field = this.dates_filter[i];
                    for (var col in this.columns){
                        if (typeof date_field !== "string"){
                            if (date_field[1] != 1)
                                console.error("Error on the dates_filter context.");
                            if (this.columns[col].name == date_field[0]){
                                this.date_field_data[date_field[0]] = [];
                                this.date_field_data[date_field[0]][0] = this.columns[col].string;
                                this.date_field_data[date_field[0]][1] = 'date';
                                break;
                            }
                        }else if (this.columns[col].name == date_field){
                            this.date_field_data[date_field] = [];
                            this.date_field_data[date_field][0] = this.columns[col].string;
                            this.date_field_data[date_field][1] = this.columns[col].type;
                            break;
                        }
                    }
                    // Remove array on dates_filter:
                    var dates_filter_tmp = [];
                    for (var i in this.dates_filter){
                        if (typeof this.dates_filter[i] !== "string")
                            dates_filter_tmp.push(this.dates_filter[i][0]);
                        else
                            dates_filter_tmp.push(this.dates_filter[i]);
                    }
                    this.dates_filter = dates_filter_tmp;
                }
                if (Object.keys(this.date_field_data).length === 0 && this.dates_filter && this.dates_filter.length > 0){
                    console.error('No field found on view: ' + this.dates_filter.toString()); 
                }
                if (Object.keys(this.date_field_data).length > 0 && this.dates_filter && this.dates_filter.length > 0){
                    this.$el.parent().prepend(QWeb.render('TreeDateSearch', {widget: this}));
                    var ui_toolbar_loc = $('.ui-toolbar:last');
                    ui_toolbar_loc.show();
                    for (var i in this.dates_filter){
                        date_field = this.dates_filter[i];
                        if (!(date_field in this.date_field_data)){
                            console.error('No field found on view: ' + date_field);
                        }
                        else{
                            var date_string = this.date_field_data[date_field][0];
                            var date_type = this.date_field_data[date_field][1];

                            var date_div =  QWeb.render('TreeDateSearchField', {'field_name': date_string});
                            var toolbar_height = ui_toolbar_loc.height();

                            ui_toolbar_loc.append(date_div);
                            $('div.oe_form_dropdown_section:last span:eq(0)').addClass('oe_date_filter_from_' + date_field);
                            $('div.oe_form_dropdown_section:last span:eq(1)').addClass('oe_date_filter_to_' + date_field);

                            this.value = new (instance.web.search.custom_filters.get_object(date_type))
                                (this, {"selectable":true,
                                    "name":"oe_date_filter_from_" + date_field, 
                                    "type": date_type,
                                    "string":date_string});
                            var value_loc = $('.oe_date_filter_from_' + date_field + ':last').show().empty();
                            this.value.appendTo(value_loc);

                            this.value = new (instance.web.search.custom_filters.get_object(date_type))
                                (this, {"selectable":true,
                                    "name":"oe_date_filter_to_" + date_field, 
                                    "type": date_type,
                                    "string":date_string});
                            value_loc = $('.oe_date_filter_to_' + date_field + ':last').show().empty();
                            this.value.appendTo(value_loc);

                            var oe_date_filter_from = $('.oe_date_filter_from_' + date_field + ':last .oe_datepicker_master');
                            var oe_date_filter_to = $('.oe_date_filter_to_' + date_field + ':last .oe_datepicker_master');
                            if (date_type == 'date'){
                                oe_date_filter_from.css("width", "105px");
                                oe_date_filter_to.css("width", "105px");
                            }
                            oe_date_filter_from.css("height", "23px");
                            oe_date_filter_to.css("height", "23px");
                            // In 2 line to fit with account move line tree view
                            if (toolbar_height < 40){
                                var $elem1 = oe_date_filter_from.parent().parent().parent().parent().parent();
                                var $elem = $elem1.find("h4");
                                $elem.css("display", "inline");
                            }
                            oe_date_filter_from.attr("placeholder", _t("From"));
                            oe_date_filter_to.attr("placeholder", _t("To"));

                            // on_change
                            oe_date_filter_from.change(function () {
                                var elem = this.parentElement.parentElement.parentElement.className;
                                var res = elem.split("oe_date_filter_from_");
                                self.current_date_from[res[1]] = this.value === '' ? null : this.value;
                                if (self.current_date_from[res[1]]){
                                    self.current_date_from[res[1]] = instance.web.parse_value(
                                        self.current_date_from[res[1]], {"widget": date_type});
                                }
                                self.do_search(self.previous_domain, self.previous_context, self.previous_group_by);
                            });
                            oe_date_filter_to.change(function () {
                                var elem = this.parentElement.parentElement.parentElement.className;
                                var res = elem.split("oe_date_filter_to_");
                                self.current_date_to[res[1]] = this.value === '' ? null : this.value;
                                if (self.current_date_to[res[1]]){
                                    self.current_date_to[res[1]] = instance.web.parse_value(
                                        self.current_date_to[res[1]], {"widget": date_type});
                                }
                                self.do_search(self.previous_domain, self.previous_context, self.previous_group_by);
                            });
                            this.on('edit:after', this, function () {
                                oe_date_filter_from.attr('disabled', 'disabled');
                                oe_date_filter_to.attr('disabled', 'disabled');
                            });
                            this.on('save:after cancel:after', this, function () {
                                oe_date_filter_from.removeAttr('disabled');
                                oe_date_filter_to.removeAttr('disabled');
                            });
                        }
                    }
                }
                else{
                    // Only hide current if it's empty
                    // Work from tree view to tree view with or withouth date_filters
                    // Work from tree view to wizard with or withouth date_filters
                    ui_toolbar_loc = $('.ui-toolbar:last');
                    if (ui_toolbar_loc.children().length === 0)
                        ui_toolbar_loc.hide();
                }
                this.tree_date_search_loaded = true;
            }
            return tmp;
        },
        do_search: function(domain, context, group_by) {
            this.previous_domain = domain;
            this.previous_context = context;
            this.previous_group_by = group_by;
            domain = this.get_dates_filter_domain(domain);
            return this._super(domain, context, group_by);
        },
        get_dates_filter_domain: function(previous_domain) {
            var domain = [];
            for (var from in this.current_date_from){
                if (this.current_date_from[from])
                    domain.push([from, '>=', this.current_date_from[from]]);
            }
            for (var to in this.current_date_to){
                if (this.current_date_to[to])
                    domain.push([to, '<=', this.current_date_to[to]]);
            }
            return new instance.web.CompoundDomain(previous_domain, domain);
        },
    });

};
