/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * Copyright 2023 Taras Shabaranskyi
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {Component} from "@odoo/owl";
import {useDebounced} from "@web/core/utils/timing";

export function useRefreshAnimation(timeout) {
    const refreshClass = "o_content__refresh";
    let timeoutId = null;

    /**
     * @returns {DOMTokenList|null}
     */
    function contentClassList() {
        const content = document.querySelector(".o_content");
        return content ? content.classList : null;
    }

    function clearAnimationTimeout() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = null;
    }

    function animate() {
        clearAnimationTimeout();
        contentClassList().add(refreshClass);
        timeoutId = setTimeout(() => {
            contentClassList().remove(refreshClass);
            clearAnimationTimeout();
        }, timeout);
    }

    return animate;
}

export class Refresher extends Component {
    setup() {
        super.setup();
        this.refreshAnimation = useRefreshAnimation(1000);
        this.onClickRefresh = useDebounced(this.onClickRefresh, 200);
    }

    /**
     * @returns {Boolean}
     */
    get displayButton() {
        const {searchModel, pagerProps} = this.props;
        const hasSearchModel = searchModel && searchModel.search;
        return Boolean(hasSearchModel || (pagerProps && pagerProps.onUpdate));
    }

    /**
     * @returns {Boolean}
     * @private
     */
    _searchModelRefresh() {
        const {searchModel} = this.props;
        if (searchModel && typeof searchModel.search === "function") {
            searchModel.search();
            return true;
        }
        return false;
    }

    /**
     * @returns {Promise<Boolean>}
     * @private
     */
    async _pagerRefresh() {
        const pagerProps = this.props.pagerProps;
        if (pagerProps && typeof pagerProps.onUpdate === "function") {
            const {limit, offset} = pagerProps;
            await pagerProps.onUpdate({offset, limit});
            return true;
        }
        return false;
    }

    /**
     * @returns {Promise<Boolean>}
     */
    async refresh() {
        let updated = this._searchModelRefresh();
        if (!updated) {
            updated = await this._pagerRefresh();
        }
        return updated;
    }

    async onClickRefresh() {
        const updated = await this.refresh();
        if (updated) {
            this.refreshAnimation();
        }
    }
}

Object.assign(Refresher, {
    template: "web_refresher.Button",
    props: {
        searchModel: {type: Object, optional: true},
        pagerProps: {type: Object, optional: true},
    },
});
