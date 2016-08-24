openerp.web_filter_tabs = function(instance) {
    var QWeb = instance.web.qweb,
      _t =  instance.web._t,
     _lt = instance.web._lt;

instance.web.search.CustomFilters.include({
    start: function() {
        this._super.apply(this, arguments);
        this.filters_tabs = {};
        this.$filters_tabs = {};
    },
    set_filters: function() {
        var self = this;
        this._super.apply(this, arguments);
        var parent = this.view.getParent();
        $('<div title="Add Current Filter"><span></span></div>').appendTo(parent.$el.find('.oe_searchview_custom_tabs_div'))
        .addClass('oe_searchview_add_custom_tab')
        .click(function(){
            var $dialog = instance.web.dialog($('<div>'), {
                            modal: true,
                            title: _t("Save Current Filter"),
                            width: 'auto',
                            height: 'auto'
                        }).html(QWeb.render('SaveFilter', {'widget': this}));
            $dialog.find('button').click(function() {
                self.$('input:first').val($dialog.find('input:first').val());
                self.$('#oe_searchview_custom_public').prop('checked',
                        $dialog.find('#oe_searchview_tab_custom_public').prop('checked'));
                self.$('#oe_searchview_custom_default').prop('checked',
                        $dialog.find('#oe_searchview_tab_custom_default').prop('checked'));
                self.$('#oe_searchview_custom_action').prop('checked',
                        $dialog.find('#oe_searchview_tab_custom_action').prop('checked'));
                var result = self.save_current();
                $dialog.dialog('destroy');
                return result;
            });
            
        });
    },
    append_filter: function(filter) {
        var self = this;
        var parent = this.view.getParent();
        var key = this.key_for(filter);
        var warning = _t("This filter is global and will be removed for everybody if you continue.");

        var $filter;
        var $filter_tab

        if (key in this.$filters_tabs) {
            $filter_tab = this.$filters_tabs[key];
        } else {
            var id = filter.id;
            this.filters_tabs[key] = filter;

            //Get the color number to add color class 
            //so that border top color remains same according to length of filter 
            var color_number = _(this.filters_tabs).toArray().length % 10;
            //Add tab in header row
            $filter_tab = this.$filters_tabs[key] = $('<li></li>')
                .appendTo(parent.$el.find('.oe_searchview_custom_tabs'))
                .addClass(filter.user_id ? 'oe_searchview_custom_private oe_color'+color_number
                                         : 'oe_searchview_custom_public oe_color'+color_number)
                .toggleClass('oe_searchview_custom_default', filter.is_default)
            $('<span></span>').appendTo($filter_tab);
            $filter_tab.find('span').text(filter.name);
        }

        if (key in this.$filters) {
            $filter = this.$filters[key];
        } else {
            var id = filter.id;
            this.filters[key] = filter;

            //Add Filter in searchbox
            $filter = this.$filters[key] = $('<li></li>')
            .appendTo(this.$('.oe_searchview_custom_list'))
            .addClass(filter.user_id ? 'oe_searchview_custom_private'
                                     : 'oe_searchview_custom_public')
            .toggleClass('oe_searchview_custom_default', filter.is_default)
            .text(filter.name);

            $('<a class="oe_searchview_custom_delete">x</a>')
                .click(function (e) {
                    e.stopPropagation();
                    if (!(filter.user_id || confirm(warning))) {
                        return;
                    }
                    self.model.call('unlink', [id]).done(function () {
                        $filter.remove();
                        delete self.$filters[key];
                        delete self.filters[key];
                    });
                })
                .appendTo($filter);
        }

        $filter.unbind('click').click(function () {
            self.toggle_filter(filter);
        });
        $filter_tab.unbind('click').click(function () {
            self.toggle_filter(filter);
        });
    },
    toggle_filter: function(filter){
        this._super.apply(this, arguments);
        var current = this.view.query.find(function (facet) {
            return facet.get('_id') === filter.id;
        });
        var previous_active_tab = _(this.$filters_tabs).detect(function($filter) {return $filter.hasClass('oe_active_tab');});
        if (previous_active_tab) {
            previous_active_tab.removeClass('oe_active_tab');
        }
        if (!current) {
            return;
        }
        this.$filters_tabs[this.key_for(filter)].addClass('oe_active_tab');
    },
    clear_selection: function () {
        this._super.apply(this, arguments);
        var previous_active_tab = _(this.$filters_tabs).detect(function($filter) {return $filter.hasClass('oe_active_tab');});
        if (previous_active_tab) {
            previous_active_tab.removeClass('oe_active_tab');
        }
    },
});

instance.web.ViewManager.include({
    switch_mode: function(view_type, no_store, view_options) {
        if (view_type != 'list' && view_type != 'kanban' && view_type != 'graph') {
            this.$el.find('.oe_custom_filter_tabs').hide();
        } else {
            this.$el.find('.oe_custom_filter_tabs').show();
        }
        return this._super.apply(this, arguments);
    }
});
};
