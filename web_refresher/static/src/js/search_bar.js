/** @odoo-module **/
/* Copyright 2023 Taras Shabaranskyi
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {patch} from "@web/core/utils/patch";
import {SearchBar} from "@web/search/search_bar/search_bar";
import {Refresher} from "./refresher.esm";

patch(SearchBar, {
    components: {...SearchBar.components, Refresher},
});

patch(SearchBar.prototype, {
    get refresherProps() {
        return {
            searchModel: this.env.searchModel,
        };
    },
});
