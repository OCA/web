/* Copyright 2025 ACSONE SA/NV
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {rpc} from "@web/core/network/rpc";
import {session} from "@web/session";

// Default session timeout in ms (will be updated from server settings)
const SESSION_TIMEOUT = 600000;

export class SessionAutoCloseService {
    constructor() {
        this.sessionTimeout = SESSION_TIMEOUT;
        this._checkIntervalId = null;
        this._boundCheckInactivity = () => this.checkInactivity();
        this._boundHandleUserActivity = () => this.handleUserActivity();
    }

    /**
     * Storage key for last activity timestamp in localStorage.
     * @returns {String}
     */
    getActivityStorageKey() {
        return "lastActivityTime";
    }

    /**
     * Get the last recorded user activity timestamp from localStorage
     * if no record is found, returns the current timestamp
     */
    getLastActivityTime() {
        const key = this.getActivityStorageKey();
        const value = globalThis.window.localStorage.getItem(key);
        return parseInt(value, 10) || Date.now();
    }

    /**
     * Set the last activity timestamp in localStorage
     * this is called whenever user interaction is detected
     */
    updateActivityTime() {
        const key = this.getActivityStorageKey();
        globalThis.window.localStorage.setItem(key, String(Date.now()));
    }

    /**
     * Destroy the session
     * removes the last activity record and reloads the page
     */
    async closeSession() {
        await rpc("/web/session/destroy", {});
        const key = this.getActivityStorageKey();
        globalThis.window.localStorage.removeItem(key);
        globalThis.window.location.reload();
    }

    /**
     * Handler for activity events; by default just updates the activity time.
     */
    handleUserActivity() {
        this.updateActivityTime();
    }

    /**
     * Checks for user inactivity and closes the session if the timeout is exceeded
     */
    checkInactivity() {
        const now = Date.now();
        const lastActivityTime = this.getLastActivityTime();
        if (now - lastActivityTime >= this.sessionTimeout) {
            this.closeSession();
        }
    }

    /**
     * Whether the service should start (e.g. only when session exists).
     * @returns {Boolean}
     */
    shouldStart() {
        return Boolean(session);
    }

    /**
     * Fetch timeout from server.
     * @returns {Promise<number>} Timeout in ms
     */
    async getTimeout() {
        const timeout = await rpc("/web/session/get_timeout", {});
        return parseInt(timeout, 10) || SESSION_TIMEOUT;
    }

    /**
     * Event bindings for activity detection.
     * @returns {{ target: EventTarget, events: string[] }}
     */
    getActivityEvents() {
        return {
            target: globalThis.window,
            events: ["mousemove", "keydown"],
        };
    }

    /**
     * Attach activity listeners and start the periodic inactivity check.
     */
    _startMonitoring() {
        const key = this.getActivityStorageKey();
        if (globalThis.window.localStorage.getItem(key)) {
            this.checkInactivity();
        }

        const {target, events} = this.getActivityEvents();
        for (const eventName of events) {
            target.addEventListener(eventName, this._boundHandleUserActivity);
        }

        this.updateActivityTime();
        const intervalMs = this.sessionTimeout / 2;
        this._checkIntervalId = globalThis.setInterval(
            this._boundCheckInactivity,
            intervalMs
        );
    }

    /**
     * Start the service: load timeout, then start monitoring if shouldStart().
     * Call once after construction.
     */
    async start() {
        this.sessionTimeout = await this.getTimeout();
        if (!this.shouldStart()) {
            return;
        }
        this._startMonitoring();
    }
}

/**
 * Default service instance, started on load.
 */
const service = new SessionAutoCloseService();
service.start();
