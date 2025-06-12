import {Component, onWillStart, useState} from "@odoo/owl";
import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {findTrip} from "@web_help/helpers.esm";
import {useService} from "@web/core/utils/hooks";

export class HelpButton extends Component {
    static props = {
        actionId: {type: [Number, String, Boolean], optional: true},
        resModel: {type: String, optional: true},
        viewType: {type: String, optional: true},
        btnClass: {type: String, optional: true},
    };
    setup() {
        this.actionService = useService("action");
        this.state = useState({
            TripClass: null,
        });
        onWillStart(async () => {
            const actionId = this.props.actionId;
            const context =
                (this.env.searchModel && this.env.searchModel.context) || {};
            const action = actionId
                ? await this.actionService.loadAction(actionId, context)
                : {};
            if ("res_model" in action) {
                const foundTrip = await findTrip(action.res_model, this.props.viewType);
                this.state.TripClass = foundTrip;
            }
        });
    }

    async onClick() {
        const TripClass = this.state.TripClass;
        const trip = new TripClass(this.env);
        await trip.setup();
        trip.start();
    }
}

HelpButton.template = "web_help.HelpButton";

Object.assign(ControlPanel.components, {HelpButton});
Object.assign(ActionDialog.components, {HelpButton});
