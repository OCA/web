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
    autoRefreshIntervalKey = "oca.web_refresher.auto_refresh";
    refreshDefaultSettingsKey = "default";
    setup() {
        super.setup();
        this.action = useService("action");
        this.refreshAnimation = useRefreshAnimation(1000);
        this.onClickRefresh = useDebounced(this.onClickRefresh, 200);
        this.onChangeAutoRefreshInterval = this.onChangeAutoRefreshInterval.bind(this);
        this.runningRefresherId = null;
        onMounted(() => {
            const intervalValue = this._getLocalStorageValue(window.location.pathname);
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

    _getLocalStorageValue(lookupKey) {
        const jsonValue = localStorage.getItem(this.autoRefreshIntervalKey);
        const refreshSettings = jsonValue ? JSON.parse(jsonValue) : {};
        let returnInterval = -1;
        let returnText = "Off";
        if (Object.hasOwn(refreshSettings, lookupKey)) {
            const {refreshInterval=-1, intervalText="Off"} = refreshSettings[lookupKey];
            returnInterval = parseInt(refreshInterval ?? -1)
            returnText = intervalText;
        } else if (Object.hasOwn(refreshSettings, this.refreshDefaultSettingsKey)) {
            const {refreshInterval=-1, intervalText="Off"} = refreshSettings[this.refreshDefaultSettingsKey];
            returnInterval = parseInt(refreshInterval ?? -1)
            returnText = intervalText;
        }
        return {refreshInterval: returnInterval, intervalText: returnText};
    }

    _setLocalStorageValue(settingsKey, {refreshInterval, intervalText}) {
        // Get current settings
        const jsonValue = localStorage.getItem(this.autoRefreshIntervalKey);
        const refreshSettings = jsonValue ? JSON.parse(jsonValue) : {};
        refreshSettings[settingsKey] = {refreshInterval, intervalText};
        const value = JSON.stringify(refreshSettings);
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

    _isRefreshIntervalDefault() {
        const intervalValue = this._getLocalStorageValue(this.refreshDefaultSettingsKey);

        if (Object.hasOwn(intervalValue, 'refreshInterval') && this.refreshInterval === intervalValue.refreshInterval) {
            return true;
        }
        return false;
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

    setRefreshAsDefault() {
        this._setLocalStorageValue(this.refreshDefaultSettingsKey, {
            refreshInterval: this.refreshInterval,
            intervalText: document.getElementById("auto-refresh-interval-text").textContent,
        });
        this._setIntervalUi(document.getElementById("auto-refresh-interval-text").textContent);
    }

    onChangeAutoRefreshInterval(clickedOption) {
        const newInterval =
            parseInt(clickedOption.value ?? clickedOption.target.value) ?? -1;
        const newIntervalText =
            clickedOption.textContent ?? clickedOption.target.textContent ?? "Off";
        this.refreshInterval = newInterval;
        this._setIntervalUi(newIntervalText);
        if (this.runningRefresherId) {
            clearTimeout(this.runningRefresherId);
        }
        this.refresh();

        this._setLocalStorageValue(window.location.pathname, {
            refreshInterval: newInterval,
            intervalText: newIntervalText,
        });
    }

    _setIntervalUi(intervalText) {
        // Check if the refresh is active and spin the refresh button if active
        const manualRefreshIcon = document.getElementById("manual-refresh-icon");
        if (manualRefreshIcon) {
            if (!this.refreshInterval || this.refreshInterval <= 0) {
                manualRefreshIcon.classList.remove("fa-spin");
            } else {
                manualRefreshIcon.classList.add("fa-spin");
            }
        }
        // Set the interval dropdown text to the selected interval
        const refreshText = document.getElementById("auto-refresh-interval-text");
        if (refreshText) {
            refreshText.textContent = intervalText;
        }
        // Check if the current interval is the default and set the star icon accordingly
        const setAsDefaultIcon = document.getElementById("set-as-default-icon");
        if (setAsDefaultIcon) {
            if (this._isRefreshIntervalDefault()) {
                setAsDefaultIcon.classList.remove("fa-star-o");
                setAsDefaultIcon.classList.add("fa-star");
            } else {
                setAsDefaultIcon.classList.remove("fa-star");
                setAsDefaultIcon.classList.add("fa-star-o");
            }
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
