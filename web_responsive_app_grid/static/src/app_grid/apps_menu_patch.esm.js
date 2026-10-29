/* License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {AppGrid} from "@web_responsive_app_grid/app_grid/app_grid.esm";
import {AppsMenu} from "@web_responsive/components/apps_menu/apps_menu.esm";

// Register AppGrid so the patched web_responsive.AppsMenu template
// can resolve it.
AppsMenu.components = Object.assign({}, AppsMenu.components, {AppGrid});
