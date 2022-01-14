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
                        (queryElem) =>
                            queryElem.filterId === filterId &&
                            queryElem.value === value &&
                            queryElem.operator === operator
                    );
                    if (!queryElem) {
                        if (isShiftKey) {
                            const groupId = Math.random();
                            this.state.query.push({
                                filterId,
                                groupId,
                                label,
                                value,
                                operator,
                            });
                        } else {
                            const {groupId} = this.state.filters[filterId];
                            this.state.query.push({
                                filterId,
                                groupId,
                                label,
                                value,
                                operator,
                            });
                        }
                    } else {
                        queryElem.label = label;
                    }
                },
            }
        );
    }
);
