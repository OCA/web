/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("refresher.Refresher", function (require) {
    "use strict";

    const ControlPanel = require("web.ControlPanel");

    const {Component, hooks} = owl;
    const {useRef} = hooks;

    class Refresher extends Component {
        _doRefresh() {
            // Note: here we use the pager props, see xml
            const {limit, currentMinimum} = this.props;
            this.trigger("pager-changed", {currentMinimum, limit});
        }
    }
    Refresher.template = "web_refresher.Button";

    // Patch control panel to initialize refresher component
    ControlPanel.components = Object.assign({}, ControlPanel.components, {
        Refresher,
    });
    ControlPanel.patch("web_refresher.ControlPanel", (T) => {
        class ControlPanelRefresher extends T {
            constructor() {
                super(...arguments);
                if ("cp_content" in this.props) {
                    const content = this.props.cp_content || {};
                    if ("$refresher" in content) {
                        this.additionalContent.refresher = content.$refresher;
                    }
                }

                this.contentRefs.refresher = useRef("refresher");
            }
        }
        return ControlPanelRefresher;
    });

    return Refresher;
});
