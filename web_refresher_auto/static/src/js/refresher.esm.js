/** @odoo-module **/
/* Copyright 2025 Miika Nissi (https://miikanissi.com)
/* License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {onWillUnmount, onWillUpdateProps, useState} from "@odoo/owl";
import {Refresher} from "@web_refresher/js/refresher.esm";
import {patch} from "web.utils";

patch(Refresher.prototype, "autorefresher_functions", {
    /**
     * Initializes the component and sets up the auto-refresh functionality.
     * It retrieves the auto-refresh interval time from the props or defaults to 1 minute.
     * It also initializes the auto-refresh state to be disabled by default.
     *
     * @override
     */
    setup() {
        this._super(...arguments);

        this.autoRefresherIntervalTime = this.props.autoRefresherIntervalTime || 60000;

        this.isRefresherMounted = false;
        const autoRefresherEnabled =
            localStorage.getItem("autoRefresherEnabled") === "true";
        this.state = useState({
            autoRefresherEnabled: autoRefresherEnabled,
        });

        this.setupAutoRefresher();

        /**
         * Lifecycle method called before the component's props are updated.
         * Clears and sets up the auto-refresher if the interval time has changed.
         *
         * @param {Object} nextProps - The next set of props.
         */
        onWillUpdateProps((nextProps) => {
            if (
                nextProps.autoRefresherIntervalTime !==
                this.props.autoRefresherIntervalTime
            ) {
                this.clearAutoRefresher();
                this.autoRefresherIntervalTime = nextProps.autoRefresherIntervalTime;
                if (this.state.autoRefresherEnabled) {
                    this.setupAutoRefresher();
                }
            }
        });

        /**
         * Lifecycle method called before the component is unmounted.
         * Clears the auto-refresh interval to prevent memory leaks.
         *
         */
        onWillUnmount(() => {
            this.isRefresherMounted = false;
            this.clearAutoRefresher();
        });
    },

    /**
     * Sets up the auto-refresh functionality.
     * If auto-refresh is enabled, it sets an interval to call the refresh function
     * at the specified interval time.
     */
    setupAutoRefresher() {
        if (!this.isRefresherMounted) {
            this.isRefresherMounted = true;
        }
        if (this.state.autoRefresherEnabled && this.displayButton) {
            this.autoRefresherInterval = setInterval(() => {
                if (this.isRefresherMounted) {
                    this.onClickRefresh();
                }
            }, this.autoRefresherIntervalTime);
        }
    },

    /**
     * Clears the auto-refresh interval if it is set.
     */
    clearAutoRefresher() {
        if (this.autoRefresherInterval) {
            clearInterval(this.autoRefresherInterval);
        }
    },

    /**
     * Toggles the auto-refresh functionality on or off.
     * It updates the auto-refresh state and sets up or clears the auto-refresh interval accordingly.
     */
    onClickToggleAutoRefresher() {
        this.state.autoRefresherEnabled = !this.state.autoRefresherEnabled;
        localStorage.setItem("autoRefresherEnabled", this.state.autoRefresherEnabled);
        this.clearAutoRefresher();
        if (this.state.autoRefresherEnabled) {
            this.setupAutoRefresher();
        }
    },
});

/**
 * @property {Number} autoRefresherIntervalTime
 */
patch(Refresher, "add_auto_refresher_props", {
    props: {
        ...Refresher.props,
        autoRefresherIntervalTime: {type: Number, optional: true},
    },
});
