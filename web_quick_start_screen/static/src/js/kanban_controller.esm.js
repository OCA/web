/** @odoo-module */
/* Copyright 2024 Tecnativa - David Vidal
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {kanbanView} from "@web/views/kanban/kanban_view";
import {registry} from "@web/core/registry";
const {xml} = owl;

export class QuickStartScreenControlPanel extends ControlPanel {}

// We want to remove the control panel from this view.
QuickStartScreenControlPanel.template = xml`<div class="d-none" />`;

export const quickStartScreenView = {
    ...kanbanView,
    ControlPanel: QuickStartScreenControlPanel,
};
registry.category("views").add("quick_start_screen", quickStartScreenView);
