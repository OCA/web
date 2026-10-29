import {Trip} from "@web_help/trip.esm";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";

export class ChangePasswordTrip extends Trip {
    setup() {
        this.addStep({
            selector: "th[data-name='new_passwd'], td[name='new_passwd']",
            content: _t("Change the password here, make sure it's secure."),
        });

        this.addStep({
            selector: "button[name='change_password_button']",
            content: _t("Click here to confirm it."),
        });
    }
}

registry.category("trips").add("change_password_trip", {
    Trip: ChangePasswordTrip,
    selector: (model, viewType) =>
        model === "change.password.wizard" && viewType === "form",
});
