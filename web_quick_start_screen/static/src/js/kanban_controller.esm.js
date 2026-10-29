/* Copyright 2024 Tecnativa - David Vidal
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {kanbanView} from "@web/views/kanban/kanban_view";
import {registry} from "@web/core/registry";

export class QuickStartScreenControlPanel extends ControlPanel {
    static template = "start_screen.ControlPanel";
}

export const quickStartScreenView = {
    ...kanbanView,
    ControlPanel: QuickStartScreenControlPanel,
};
registry.category("views").add("quick_start_screen", quickStartScreenView);
