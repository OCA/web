/** @odoo-module **/
import LegacyControlPanel from "web.ControlPanel";
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {findTrip} from "@web_help/helpers.esm";
import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {useService} from "@web/core/utils/hooks";
const {Component} = owl;
const {useState, onWillStart} = owl.hooks;

export class HelpButton extends Component {
    setup() {
        this.state = useState({
            TripClass: null,
        });
        onWillStart(async () => {
            const foundTrip = await findTrip(this.props.resModel, this.props.viewType);
            this.state.TripClass = foundTrip;
        });
        this.highlighterService = useService("highlighter");
    }

    async onClick() {
        const TripClass = this.state.TripClass;
        const trip = new TripClass(this.env, this.highlighterService);
        await trip.setup();
        trip.start();
    }
}

HelpButton.template = "web_help.HelpButton";

Object.assign(ControlPanel.components, {HelpButton});
Object.assign(LegacyControlPanel.components, {HelpButton});
Object.assign(ActionDialog.components, {HelpButton});
