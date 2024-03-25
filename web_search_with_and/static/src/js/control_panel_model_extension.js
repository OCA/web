odoo.define(
    "web_search_with_and/static/src/js/control_panel_model_extension.js",
    function (require) {
        "use strict";

        const {patch} = require("web.utils");
        const components = {
            ControlPanelModelExtension: require("web/static/src/js/control_panel/control_panel_model_extension.js"),
        };

        patch(
            components.ControlPanelModelExtension,
            "web_search_with_and/static/src/js/control_panel_model_extension.js",
            {
                addAutoCompletionValues({
                    filterId,
                    label,
                    value,
                    operator,
                    isShiftKey,
                }) {
                    const queryElem = this.state.query.find(
                        (queryElem_val) =>
                            queryElem_val.filterId === filterId &&
                            queryElem_val.value === value &&
                            queryElem_val.operator === operator
                    );
                    if (!queryElem) {
                        const {groupId} = this.state.filters[filterId];
                        this.state.query.push({
                            filterId,
                            groupId,
                            label,
                            value,
                            operator,
                        });
                        if (isShiftKey) {
                            const group_id = Math.random();
                            this.state.query.push({
                                filterId,
                                group_id,
                                label,
                                value,
                                operator,
                            });
                        }
                    }
                    if (queryElem) {
                        queryElem.label = label;
                    }
                },
            }
        );
    }
);
