odoo.define('web_search_alphabetic',function(require){
"use strict";

    var core = require('web.core')
    var QWeb = core.qweb
    var SearchView = require('web.SearchView');
    var ViewManager = require('web.ViewManager');
    var FormView = require('web.FormView');
    var ControlPanel = require('web.ControlPanel');

    SearchView.include({
        start: function() {
            var self = this;
            return $.when(this._super()).done(function(){
                if(self.ViewManager && self.ViewManager.action && self.ViewManager.action.target != 'new'){
                    self.search_on = "name";
                    self.fields_selection = [];
                    self.dataset.call('fields_get', [false, {}]).done(function (fields) {
                        $.each(fields, function (value) {
                            if(fields[value].type == "char") {
                                fields[value].id = value;
                                self.fields_selection.push(fields[value]);
                            }
                        })
                        if(self.fields_selection.length){
                            if($("#field_name_selection")){
                                $("#field_name_selection").remove();
                            }
                            if($('.field_selection_column')[0]){
                                $('.field_selection_column').append((QWeb.render('field-selection', {widget: self})));
                                self.search_on = $('#field_name_selection').val();
                                $("#field_name_selection").change(function(){
                                    self.search_on =  $(this).val() || false;
                                });
                                $('.oe_filter_label').unbind('click').bind('click',function (e) {
                                    $(this).toggleClass('enabled');
                                    if($(this).hasClass('enabled')){
                                        $(this).addClass('highlight')
                                    }
                                    else{
                                        $(this).removeClass('highlight')
                                    }
                                    self.do_search();
                                });
                            }
                        }
                    });
                }
            });
        },

        search_filter: function() {
            var filter_domain = [];
            var self = this;
            _.each($('.oe_filter_label'), function(value) {
                if ($(value).hasClass('enabled') && $(value).attr('id') && self.search_on) {
                    filter_domain.push("[('" + self.search_on + "', '=ilike', '" + $(value).attr('id').split('_')[1] + "%')]")
                }
            });
            if (filter_domain.length) {
                var filter_or_domain = [];
                for (var i = 0; i < filter_domain.length-1; i++) {
                    filter_or_domain.push("['|']");
                }
                return filter_or_domain.concat(filter_domain || []);
            }
            return false;
        },

        build_search_data: function () {
            var result = this._super();
            var filter_domain = this.search_filter();
            if (filter_domain)
                result['domains'] = filter_domain.concat(result.domains || []);
            return result;
        }, 
    });

    ViewManager.include({
        switch_mode: function(view_type, view_options) {
            var self = this;
            var view = this.views[view_type];
            var result = this._super(view_type, view_options);
            if(this.action && this.action.target != 'new'){
                if (this.searchview) {
                    if(view_type=="form" || (view.controller.searchable === false || this.searchview.options.hidden) || this.active_view == "form"){
                            $('.search_filter').on().hide();
                    }else{
                        $('.search_filter').show();
                    }
                }else{
                    $('.search_filter').on().hide();
                }
            }
            return result;
        },
    });

    FormView.include({
        load_defaults: function () {
            if($('.search_filter'))
                $('.search_filter').hide();
            return this._super();
        },
    });

    ControlPanel.include({
        _toggle_visibility: function(visible) {
            this._super();
            this.do_toggle(visible);
            if (!visible && !this.$content) {
                this.$content = this.$el.contents().detach();
            } else if (this.$content) {
                this.$content.appendTo(this.$el);
                this.$content = null;
            }
        },
    })
});
