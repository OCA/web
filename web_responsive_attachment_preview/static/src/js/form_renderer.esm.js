/* Copyright 2024 Hunki Enterprises BV
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0) */

import {unpatchDisableFilePreview} from "@web_responsive/views/form/form_renderer.esm";

// Restore Odoo's native attachment preview on forms that declare a preview container.
unpatchDisableFilePreview();
