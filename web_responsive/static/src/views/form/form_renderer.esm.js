/* Copyright 2024 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {FormRenderer} from "@web/views/form/form_renderer";
import {patch} from "@web/core/utils/patch";

export const unpatchDisableFilePreview = patch(FormRenderer.prototype, {
    /** @returns {Boolean}*/
    hasFileViewer() {
        return false;
    },
});
