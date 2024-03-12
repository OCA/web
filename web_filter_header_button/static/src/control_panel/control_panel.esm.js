/** @odoo-module **/
import {FilterButton} from "../filter_button/filter_button.esm";
import LegacyControlPanel from "web.ControlPanel";
import {patch} from "web.utils";

patch(LegacyControlPanel, "filter_button.ControlPanel", {
    components: {
        ...LegacyControlPanel.components,
        FilterButton,
    },
});
