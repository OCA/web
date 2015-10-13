openerp.web_search_alphabetic = function (instance) {
	var QWeb = instance.web.qweb;
    instance.web.SearchView.include({
        start: function() {
            var result = this._super();
            var self = this;
            self.search_on = "name";
            self.fields_selection = [];
            this.dataset.call('fields_get', [false, {}]).done(function (fields) {
                $.each(fields, function (value) {
                    if(fields[value].type == "char"){
                        fields[value].id = value;
                        self.fields_selection.push(fields[value]);
                    }
                })
                if(self.fields_selection.length){
                    $('.field_selection_column').append((QWeb.render('field-selection', {widget: self})));
                    $("#field_name_selection").change(function(){
                        self.search_on =  $(this).val() || false;
                    })
                }
            });
            $('.oe_filter_label').click(function (e) {
                $(this).toggleClass('enabled');
                self.do_search();
            });
            return result;
        },
        search_filter: function(){
            var filter_domain = [];
            var self = this;
            _.each($('.oe_filter_label'), function(value) {
                if ($(value).hasClass('enabled') && $(value).attr('id') && self.search_on) {
                    filter_domain.push("[('" + self.search_on + "', '=ilike', '" + $(value).attr('id').split('_')[1] + "%')]")
                }
            });
            if (filter_domain.length) {
                var filter_or_domain = [];
                for (i = 0; i < filter_domain.length-1; i++) {
                    filter_or_domain.push("['|']");
                }
                return filter_or_domain.concat(filter_domain || []);
            }
            return false;
        },
        build_search_data: function () {
            var result = this._super();
            filter_domain = this.search_filter();
            if (filter_domain)
                result['domains'] = filter_domain.concat(result.domains || []);
            return result;
        }, 
    });

    instance.web.ViewManager.include({
        switch_mode: function(view_type, no_store, view_options) {
            var view = this.views[view_type];
            var result = this._super(view_type, no_store, view_options);
            if (this.searchview && this.active_view != "form") {
                if ((view.controller.searchable === false || this.searchview.options.hidden)  || this.active_view == "form"){
                    $('.search_filter').live().hide();
                }else
                    $('.search_filter').show();
            }
            else{
                $('.search_filter').live().hide();
            }
            return result;
        },
    });
    instance.web.FormView.include({
        load_defaults: function () {
            if($('.search_filter'))
                $('.search_filter').hide();
            return this._super();
        },
    });
};

// vim:et fdc=0 fdl=0 foldnestmax=3 fdm=syntax:
