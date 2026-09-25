// Copyright 2026 Quartile (https://www.quartile.co)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(SelectCreateDialog.prototype, {
    get noCreateFromConfig() {
        const config = session.web_m2x_dialog_no_create || {};
        const allowed = config.allowed_models || [];
        return !allowed.includes(this.props.resModel);
    },
});
