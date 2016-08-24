openerp.web_filter_tabs = function(instance) {
    var QWeb = instance.web.qweb,
      _t =  instance.web._t,
     _lt = instance.web._lt;

    instance.web.search.CustomFilters.include({
        init: function(){
            this._super.apply(this, arguments);
            this.tab_filters = {};
        },
        append_filter: function(filter) {
            var self = this;
            this._super.apply(this, arguments);
            var key = this.key_for(filter);
            this.$filters[key].find('a').unbind('click').click(function(e){
                e.stopPropagation();
                self.remove_filter(filter, filter.id);
            });
            this.add_tab(key);
        },
        add_tab: function(key){
            this.tab_filters[key] = new instance.web.search.TabFilters(this, key);
            this.tab_filters[key].appendTo($('.oe_searchview_custom_tabs'))
        },
        remove_filter: function(filter, id) {
            var self = this;
            var key = this.key_for(filter);
            var warning = _t("This filter is global and will be removed for everybody if you continue.");
            var $filter = this.$filters[key];
            if (!(filter.user_id || confirm(warning))) {
                    return;
                }
                this.model.call('unlink', [id]).done(function () {
                    $filter.remove();
                    delete self.$filters[key];
                    delete self.filters[key];
                    self.tab_filters[key].destroy();
                });
        },
        toggle_filter: function (filter, preventSearch) {
            this._super.apply(this, arguments);
            var current = this.view.query.find(function (facet) {
                return facet.get('_id') === filter.id;
            });
            active_tab = _(this.tab_filters).detect(function(tab_filter) { return tab_filter.$el.hasClass('oe_selected'); })
            //super already adds current facet, so applied reverse condition
            if (!current && active_tab) {
                active_tab.$el.removeClass('oe_selected');
                return;
            }
            if (current)
                this.tab_filters[this.key_for(filter)].$el.addClass('oe_selected');
        },
        clear_selection: function() {
            _(this.tab_filters).each(function(tab_filter){tab_filter.$el.removeClass('oe_selected')})
            this._super.apply(this, arguments);
        }
    });
    instance.web.search.TabFilters = instance.web.Widget.extend({
        init: function(parent, key){
            this._super.apply(this, arguments);
            this.key = key;
            this.filter = parent.$filters[key].clone(true, true);
            this.parent = parent;
        },
        renderElement: function(){
            return this.replaceElement(this.filter)
        },
        destroy: function(){
            delete this.parent.tab_filters[this.key];
            return this._super.apply(this, arguments);
        }
    });
    instance.web.ViewManager.include({
        switch_mode: function(view_type, no_store, view_options) {
            if(view_type == 'form') {
                this.$el.find('.oe_custom_filter_tabs').hide();
            } else {
                this.$el.find('.oe_custom_filter_tabs').show();
            }
            return this._super.apply(this, arguments);
        }
    });
};