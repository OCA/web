odoo.define("web_hide_empty_groups.Models", function(require) {
    "use strict";

    var core = require("web.core");
    // Var GanttModel = require('web_gantt.GanttModel');
    var ListModel = require("web.ListModel");

    ListModel.include({
        _readGroup: function(list, options) {
            var self = this;
            if (1) {
                // TODO need some condition here?
                var context = _.extend(list.context, {
                    action_data: self.__parentedParent.actionViews,
                    view_type: "list",
                });
                list.context = context;
            }
            return this._super(list, options);
        },
    });

    // GanttModel.include({
    //     _fetchData: function () {
    //         var self = this;
    //         if (self.ganttData) {
    //             var context = _.extend(this.context, {
    //                 'action_data': self.__parentedParent.actionViews,
    //                 'view_type': 'gantt'
    //             });
    //             this.context = context;
    //         }
    //         return this._super();
    //     },
    // });
});
