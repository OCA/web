odoo.define("web_refresh.WebRefresh", function (require) {
    "use strict";

    const ControlPanel = require("web.ControlPanel");
    const DropdownMenu = require("web.DropdownMenu");
    const CustomMenuItem = require("web_refresh.CustomMenuItem");
    require("web.LocalStorageService");
    require("bus.BusService");
    const core = require("web.core");
    /* global owl */
    const {browser} = owl;

    /*
This file contains some code to make "Refresh on server changes" feature work.
There are three execution points to achieve it:

[   ] 1. Server patch to base model to collect all server changes
         and pass them to "bus.bus".
[*  ] 2. JS Controller patch and OWL Component that subscribes to longpolling
         notification and process some heuristics to determine if refresh
         is necessary. If heuristics don't match server request is performed.
[   ] 3. Server controller that makes db query and determine if refresh is
         necessary for current view state (domain, context, folds, etc.)

Asterisks [*] indicate how many code for this execution point is placed in this file.
*/

    class WebRefresh extends DropdownMenu {
        constructor() {
            super(...arguments);
            this.state.refreshEvery = false;
            this.state.refreshEverySeconds = this.props.defaultRefreshEvery;
            this.state.watchChanges = false;
            this.state.elapsed = 0;
            this.state.refreshing = false;
            this.waitingForOpen = false;
            this.state.pending = false;
            this.defaultSettings = [false, this.props.defaultRefreshEvery, false];
        }

        mounted() {
            this.tickTimeout = browser.setInterval(this._timeoutTick.bind(this), 1000);
            core.bus.on("web_refresh_reloaded", this, this._onViewReloaded);
            core.bus.on("web_refresh_blocked", this, this._onViewRefreshBlocked);
            core.bus.on("web_refresh_refresh", this, this._refresh);
            this._loadLocalStorage();
            this.state.elapsed = this.state.refreshEvery
                ? this.state.refreshEverySeconds
                : 0;
            if (this.state.watchChanges) {
                this._onWatchChanged();
            }
        }

        willUnmount() {
            if (this.state.watchChanges) {
                this.state.watchChanges = false;
                this._onWatchChanged();
            }
            browser.clearTimeout(this.tickTimeout);
            browser.clearTimeout(this.openTimeout);
            core.bus.off("web_refresh_reloaded", this, this._onViewReloaded);
            core.bus.off("web_refresh_blocked", this, this._onViewRefreshBlocked);
            core.bus.off("web_refresh_refresh", this, this._refresh);
        }

        _onNotifications(notifications) {
            for (const notification of notifications) {
                if (notification[0] === "web_refresh") {
                    console.log(notification);
                    this.trigger("web_refresh", {notification: notification[1]});
                }
            }
        }

        _onWatchChanged() {
            if (this.state.watchChanges) {
                this.env.services.bus_service.on(
                    "notification",
                    this,
                    this._onNotifications
                );
                this.env.services.bus_service.addChannel("web_refresh");
            } else {
                this.env.services.bus_service.deleteChannel("web_refresh");
                this.env.services.bus_service.off(
                    "notification",
                    this,
                    this._onNotifications
                );
            }
        }
        _onViewReloaded(viewMode) {
            this.state.refreshing = false;
            if (viewMode === "readonly" && this.state.pending) {
                this.state.pending = false;
                this._refresh();
            } else if (this.state.elapsed < this.props.minRefreshEvery) {
                this.state.elapsed = this.props.minRefreshEvery;
            }
        }

        _onViewRefreshBlocked() {
            this.state.refreshing = false;
            this.state.pending = true;
        }

        get displayChevron() {
            return false;
        }

        get dropdownMenuAlignClass() {
            return core._t.database.parameters.direction === "rtl"
                ? "dropdown-menu-left"
                : "dropdown-menu-right";
        }

        get storageName() {
            return "web_refresh.action=" + this.env.action.id;
        }

        _loadLocalStorage() {
            [
                this.state.refreshEvery,
                this.state.refreshEverySeconds,
                this.state.watchChanges,
            ] =
                this.env.services.local_storage.getItem(this.storageName) ||
                this.defaultSettings;
            if (!this.props.allowRefreshEvery) {
                this.state.refreshEvery = false;
            }
            if (!this.props.allowWatchChanges) {
                this.state.watchChanges = false;
            }
        }

        _saveLocalStorage() {
            var settings = [
                this.state.refreshEvery,
                this.state.refreshEverySeconds,
                this.state.watchChanges,
            ];
            if (_.isEqual(settings, this.defaultSettings)) {
                this.env.services.local_storage.removeItem(this.storageName);
            } else {
                this.env.services.local_storage.setItem(this.storageName, settings);
            }
        }

        _toggleRefreshEvery() {
            this.state.refreshEvery = !this.state.refreshEvery;
            this._saveLocalStorage();
            this.state.elapsed = this.state.refreshEvery
                ? this.state.refreshEverySeconds
                : 0;
        }

        _toggleWatchChanges() {
            this.state.watchChanges = !this.state.watchChanges;
            this._saveLocalStorage();
            this._onWatchChanged();
        }

        _onClick() {
            if (this.state.open && !this.waitingForOpen) {
                this.state.open = false;
            } else if (this.openTimeout) {
                browser.clearTimeout(this.openTimeout);
                this.openTimeout = null;
                this._refresh();
            }
            this.waitingForOpen = false;
        }

        _onMouseDown() {
            if (!this.state.open) {
                this.openTimeout = browser.setTimeout(this._openMenu.bind(this), 500);
            }
        }

        _openMenu() {
            this.openTimeout = null;
            if (this.props.allowRefreshEvery || this.props.allowWatchChanges) {
                this.state.open = true;
                this.waitingForOpen = true;
            }
        }

        _onRefreshEveryChanged(ev) {
            console.log(ev);
            this.state.refreshEverySeconds = ev.detail.value;
            if (this.state.refreshEverySeconds < this.props.minRefreshEvery) {
                this.state.refreshEverySeconds = this.props.minRefreshEvery;
            }
            this._saveLocalStorage();
            this.state.elapsed = this.state.refreshEverySeconds;
        }

        async _timeoutTick() {
            if (this.state.elapsed > 0) {
                this.state.elapsed--;
            }
            if (this.state.refreshEvery && this.state.elapsed === 0) {
                await this._refresh();
            }
        }

        async _refresh() {
            console.log("Refresh");
            if (this.state.refreshing) {
                this.state.elapsed = this.props.minRefreshEvery;
            } else {
                this.state.refreshing = true;
                this.trigger("web_refresh");
                this.state.elapsed = this.state.refreshEverySeconds;
            }
        }

        get segmentOffset() {
            // Circle length (2 * 3.14 * Radius, 2 * 3.14 * 11 ~= 69)
            var segmentOffset = 69.0;
            if (this.state.refreshEvery) {
                segmentOffset -=
                    Math.round(
                        (segmentOffset * this.state.elapsed * 10) /
                            this.state.refreshEverySeconds
                    ) / 10;
            }
            return segmentOffset;
        }
    }
    WebRefresh.template = "web_refresh.WebRefresh";
    WebRefresh.components = Object.assign({}, DropdownMenu.components, {
        CustomMenuItem,
    });
    WebRefresh.props = Object.assign({}, DropdownMenu.props, {
        allowWatchChanges: {type: Boolean},
        allowRefreshEvery: {type: Boolean},
        defaultRefreshEvery: {type: Number},
        minRefreshEvery: {type: Number},
    });

    Object.assign(ControlPanel.components, {WebRefresh});

    return WebRefresh;
});
