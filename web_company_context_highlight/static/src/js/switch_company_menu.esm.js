/**
 * Copyright 2026 Acsone
 * @author Pierre Verkest <pierre.verkest@apycod.fr>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {SwitchCompanyMenu} from "@web/webclient/switch_company_menu/switch_company_menu";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(SwitchCompanyMenu.prototype, {
    setup() {
        super.setup();
        this.highlightColor = session.web_company_context_highlight_color || "#ffc107";
        this.highlightTextColor =
            session.web_company_context_highlight_text_color || "#212529";
    },
});
