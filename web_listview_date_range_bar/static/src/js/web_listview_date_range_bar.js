openerp.web_listview_date_range_bar = function(instance)
{
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.views.add(
        'listview_date_range_bar',
        'instance.web.web_listview_date_range_bar.DateRangeBar'
        );

    instance.web.web_listview_date_range_bar = instance.web.web_listview_date_range_bar || {};


    instance.web.web_listview_date_range_bar.DateRangeBar=
        instance.web.ListView.extend({

            init: function(parent, dataset, view_id, _options) {
                this._super.apply(this, arguments);

                var ctx = this.dataset.get_context().eval()
                this.date_start = ctx.list_date_range_bar_start || ''
                this.date_end = ctx.list_date_range_bar_end || ''
                },

            start: function() {
                var tmp = this._super.apply(this, arguments);
                var self = this;

                this.$el.parent().prepend(QWeb.render("list_date_range_bar_selector", {widget: this}));

                var date_start_widget = new instance.web.DateWidget(this);
                date_start_widget.appendTo(this.$el.parent().find('.oe_list_date_range_bar_start'));
                date_start_widget.set_value( self.date_start );

                date_start_widget.on('datetime_changed', this, _.bind(function() {
                    self.date_start = date_start_widget.get_value();
                    self.do_search(self.last_domain, self.last_context, self.last_group_by);
                }), this);

                var date_end_widget = new instance.web.DateWidget(this);
                date_end_widget.appendTo(this.$el.parent().find('.oe_list_date_range_bar_end'));
                date_end_widget.set_value( self.date_end );

                date_end_widget.on('datetime_changed', this, _.bind(function() {
                    self.date_end = date_end_widget.get_value();
                    self.do_search(self.last_domain, self.last_context, self.last_group_by);
                }), this);

                return tmp;
            },

            do_search: function(domain, context, group_by) {
                var self = this;
                this.last_domain = domain;
                this.last_context = context;
                this.last_group_by = group_by;
                this.old_search = _.bind(this._super, this);

                self.last_context["list_date_range_bar_start"] = self.date_start;
                self.last_context["list_date_range_bar_end"] = self.date_end;

                return self.old_search(self.last_domain, self.last_context, self.last_group_by);
            },
        });
};
