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
            // In a dialog (e.g. the change-password wizard) the model is passed
            // directly via the resModel prop; in the control panel only the
            // actionId is known and the model has to be resolved from it.
            let resModel = this.props.resModel;
            if (!resModel && this.props.actionId) {
                const context =
                    (this.env.searchModel && this.env.searchModel.context) || {};
                const action = await this.actionService.loadAction(
                    this.props.actionId,
                    context
                );
                resModel = action.res_model;
            }
            if (resModel) {
                this.state.TripClass = await findTrip(resModel, this.props.viewType);
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
