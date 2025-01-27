/* Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2025 Carlos Lopez - Tecnativa
 * Copyright 2025 Mohamed Alkobrosli - Kencove
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {stepUtils} from "@web_tour/tour_service/tour_utils";
import {patch} from "@web/core/utils/patch";

/* Make base odoo JS tests working */
patch(stepUtils, {
    showAppsMenuItem() {
        return {
            edition: "community",
            trigger: "button.o_grid_apps_menu__button",
            auto: true,
            position: "bottom",
        };
    },
});
