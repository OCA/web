/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * Copyright 2023 Taras Shabaranskyi
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {Component, onMounted, onWillUnmount} from "@odoo/owl";
import {useDebounced} from "@web/core/utils/timing";
import {useService} from "@web/core/utils/hooks";

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
    autoRefreshIntervalKey = "autoRefreshInterval";
    setup() {
        super.setup();
        this.action = useService("action");
        this.refreshAnimation = useRefreshAnimation(1000);
        this.onClickRefresh = useDebounced(this.onClickRefresh, 200);
        this.onChangeAutoRefreshInterval = this.onChangeAutoRefreshInterval.bind(this);
        this.runningRefresherId = null;
        const intervalValue = this._getLocalStorageValue();
        onMounted(() => {
            this.onChangeAutoRefreshInterval({
                value: intervalValue.refreshInterval,
                textContent: intervalValue.intervalText,
            });
        });
        onWillUnmount(() => {
            if (this.runningRefresherId) {
                clearTimeout(this.runningRefresherId);
            }
        });
    }

    _getLocalStorageValue() {
        const jsonValue = localStorage.getItem(this.autoRefreshIntervalKey);
        if (jsonValue) {
            const {refreshInterval, intervalText} = JSON.parse(jsonValue);
            return {refreshInterval: parseInt(refreshInterval ?? -1), intervalText};
        }
        return {refreshInterval: -1, intervalText: "Off"};
    }

    _setLocalStorageValue({refreshInterval, intervalText}) {
        const value = JSON.stringify({refreshInterval, intervalText});
        localStorage.setItem(this.autoRefreshIntervalKey, value);
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
        let updated = await this._pagerRefresh();
        if (!updated) {
            updated = this._searchModelRefresh();
        }
        // Check the refreshInterval is greater than 0 and start a timer for the next refresh
        if (this.refreshInterval > 0) {
            // Always attempt to clear a running timeout in case the refresh was done manually
            if (typeof this.runningRefresherId === "number") {
                clearTimeout(this.runningRefresherId);
            }
            this.runningRefresherId = setTimeout(() => {
                this.refresh();
            }, this.refreshInterval);
        }
        return updated;
    }

    /**
     * Function to refresh the views that has not the props
     * required by the refresher, like ir.actions.report or
     * ir.actions.client.
     */
    async refreshReport() {
        const viewAction = this.action.currentController.action;
        const options = {};
        if (this.env.config.breadcrumbs.length > 1) {
            const breadcrumb = this.env.config.breadcrumbs.slice(-1);
            await this.action.restore(breadcrumb.jsId);
        } else {
            options.clearBreadcrumbs = true;
        }
        this.action.doAction(viewAction, options);
    }

    async onClickRefresh() {
        const {searchModel, pagerProps} = this.props;
        if (!searchModel && !pagerProps) {
            return this.refreshReport();
        }
        const updated = await this.refresh();
        if (updated) {
            this.refreshAnimation();
        }
    }

    onChangeAutoRefreshInterval(clickedOption) {
        const newInterval =
            parseInt(clickedOption.value ?? clickedOption.target.value) ?? -1;
        const newIntervalText =
            clickedOption.textContent ?? clickedOption.target.textContent;
        this.refreshInterval = newInterval;
        this._setIntervalButtonText(newIntervalText);
        this._setLocalStorageValue({
            refreshInterval: newInterval,
            intervalText: newIntervalText,
        });
        if (this.runningRefresherId) {
            clearTimeout(this.runningRefresherId);
        }
        this.refresh();
    }

    _setIntervalButtonText(intervalText = "Off") {
        const manualRefreshIcon = document.getElementById("manual-refresh-icon");
        if (manualRefreshIcon) {
            if (!this.refreshInterval || this.refreshInterval <= 0) {
                manualRefreshIcon.classList.remove("fa-spin");
            } else {
                manualRefreshIcon.classList.add("fa-spin");
            }
        }
        const refreshText = document.getElementById("auto-refresh-interval-text");
        if (refreshText) {
            refreshText.textContent = intervalText;
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
