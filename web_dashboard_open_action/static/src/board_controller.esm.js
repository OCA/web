/** @odoo-module **/
import {BoardAction} from "@board/board_action";
import {BoardController} from "@board/board_controller";
import {patch} from "@web/core/utils/patch";

patch(BoardController.prototype, "add openAction function", {
    async openAction(action_handle) {
        if (action_handle.viewMode === "spreadsheet_board") {
            return this.env.services.action.doAction({
                type: "ir.actions.client",
                tag: "action_spreadsheet_oca",
                params: {
                    spreadsheet_id: action_handle.actionId,
                    model: "spreadsheet.dashboard",
                },
            });
        }
        let action = BoardAction.cache[action_handle.actionId];
        if (!action) {
            action = await this.rpc("/web/action/load", {
                action_id: action_handle.actionId,
            });
        }
        _.each(this.props.board.columns, (column) => {
            _.each(column.actions, (board_widget) => {
                if (action_handle.id === board_widget.id) {
                    action.context = board_widget.context;
                    action.domain = board_widget.domain;
                }
            });
        });
        return this.env.services.action.doAction(action);
    },
});
