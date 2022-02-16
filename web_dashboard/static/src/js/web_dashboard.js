odoo.define("web_dashboard.dashboard_action", function(require) {
    "use strict";

    var relationalFields = require("web.relational_fields");
    var registry = require("web.field_registry");
    var FieldMany2ManyTags = relationalFields.FieldMany2ManyTags;

    var KanbanDashboardAction = FieldMany2ManyTags.extend({
        tag_template: "KanbanDashboardAction",
        fieldsToFetch: {
            display_name: {type: "char"},
            related_records_count: {type: "integer"},
            visibility: {type: "boolean"},
            specific_model_action: {type: "char"},
        },
    });

    registry.add("kanban.dashboard_action", KanbanDashboardAction);
});
