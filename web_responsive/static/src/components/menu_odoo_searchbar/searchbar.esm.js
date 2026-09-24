/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Component, proxy, signal, useProps} from "@odoo/owl";
import {useAutofocus, useService} from "@web/core/utils/hooks";

/**
 * @extends Component
 * @property {function(): HTMLInputElement} searchBarInput
 */
export class AppsMenuOdooSearchBar extends Component {
    props = useProps({});

    setup() {
        super.setup();
        this.state = proxy({
            rootItems: [],
            subItems: [],
            offset: 0,
            hasResults: false,
        });
        this.searchBarInputRef = signal.ref();
        this.searchBarInput = useAutofocus({ref: this.searchBarInputRef});
        this.command = useService("command");
    }

    /**
     * @returns {String}
     */
    get inputValue() {
        const el = this.searchBarInput();
        return el ? el.value : "";
    }

    set inputValue(value) {
        const el = this.searchBarInput();
        if (el) {
            el.value = value;
        }
    }

    _onSearchInput() {
        if (this.inputValue) {
            this._openSearchMenu(this.inputValue);
            this.inputValue = "";
        }
    }

    _onSearchClick() {
        this._openSearchMenu();
    }

    /**
     * @param {String} [value]
     * @private
     */
    _openSearchMenu(value) {
        const searchValue = value ? `/${value}` : "/";
        this.command.openMainPalette({searchValue}, null);
    }
}

AppsMenuOdooSearchBar.template = "web_responsive.AppsMenuOdooSearchBar";
