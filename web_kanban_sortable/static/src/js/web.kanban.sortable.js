odoo.define('web_kanban_sortable.web_kanban', function (require) {
'use strict';

var Model = require('web.Model');
var KanbanRecord = require('web_kanban.Record');
var KanbanView = require('web_kanban.KanbanView');

KanbanRecord.include({
	renderElement: function () {
        this._super();
        this.$el.attr('data-id', this.id);
    },
});

KanbanView.include({
	render_ungrouped: function (fragment) {
		var self = this;
		self._super(fragment);
		if(this.fields.sequence){
			var model = new Model(self.model);
			this.$el.sortable({
				stop: function () {
					var ids = [];
					self.$el.children().each(function (index, u) {
						var id = $(u).data('id');
						if(id){
							model.call('write', [[id], {sequence: index}]);
						}
					});
				},
			});
        }
    },
});

});