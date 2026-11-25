/*
    Copyright 2026 Roberto Fichera
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {SIZES} from "@web/core/ui/ui_service";
import {listPanelAutoFor} from "./origin.esm";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {useState} from "@odoo/owl";

patch(ControlPanel.prototype, {
    setup() {
        super.setup();
        this.listPanelAuto = listPanelAutoFor(this.env);
        this.listPanelAutoState = this.listPanelAuto
            ? useState(this.listPanelAuto.state)
            : null;
        this.listPanelUi = useState(useService("ui"));
    },

    /** The panel is hidden below LG, so its button is too. */
    get showListPanelAuto() {
        return Boolean(this.listPanelAuto) && this.listPanelUi.size >= SIZES.LG;
    },
});
