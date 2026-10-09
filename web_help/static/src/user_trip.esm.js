import {Trip} from "@web_help/trip.esm";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";

export class UserTrip extends Trip {
    setup() {
        this.addStep({
            selector: ".o_list_button_add, .o-kanban-button-new",
            content: _t("To create a new user click here."),
        });

        this.addStep({
            selector: ".o_cp_searchview",
            content: _t("Use the searchbar to find specific users."),
            renderContext: {
                cbBtnText: _t("Next"),
                closeBtnText: _t("Cancel"),
            },
        });

        this.addStep({
            selector: ".o_cp_switch_buttons",
            content: _t("You can switch to different views here."),
        });
    }
}

registry.category("trips").add("user_trip", {
    Trip: UserTrip,
    selector: (model, viewType) =>
        model === "res.users" && ["list", "kanban"].includes(viewType),
});
