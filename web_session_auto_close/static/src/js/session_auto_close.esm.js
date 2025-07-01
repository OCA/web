/** @odoo-module **/

/* Copyright 2025 ACSONE SA/NV
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {rpc} from "@web/core/network/rpc";
import {session} from "@web/session";

// Default session timeout in ms (will be updated from server settings)
let SESSION_TIMEOUT = 600000;

/**
 * Get the last recorded user activity timestamp from localStorage
 * if no record is found, returns the current timestamp
 */
function getLastActivityTime() {
    return (
        parseInt(globalThis.window.localStorage.getItem("lastActivityTime"), 10) ||
        Date.now()
    );
}

/**
 * Set the last activity timestamp in localStorage
 * this is called whenever user interaction is detected
 */
function updateActivityTime() {
    const now = Date.now();
    globalThis.window.localStorage.setItem("lastActivityTime", now);
}

/**
 * Destroy the session
 * removes the last activity record and reloads the page
 */
function closeSession() {
    rpc("/web/session/destroy", {}).then(() => {
        globalThis.window.localStorage.removeItem("lastActivityTime");
        globalThis.window.location.reload();
    });
}

/**
 * Checks for user inactivity and closes the session if the timeout is exceeded
 */
function checkInactivity() {
    const now = Date.now();
    const lastActivityTime = getLastActivityTime();
    if (now - lastActivityTime >= SESSION_TIMEOUT) {
        closeSession();
    }
}

/**
 * Init the session auto-close mechanism
 * attaches event listeners to detect user activity and sets periodic
   inactivity checks
 */
function startSessionAutoClose() {
    if (!session) {
        return;
    }

    // Immediately check inactivity if a last activity timestamp exists
    if (globalThis.window.localStorage.getItem("lastActivityTime")) {
        checkInactivity();
    }

    function handleUserActivity() {
        updateActivityTime();
    }

    // Listen for user interactions to reset the activity timer
    globalThis.window.addEventListener("mousemove", handleUserActivity);
    globalThis.window.addEventListener("keydown", handleUserActivity);

    // Set the initial activity time and start the periodic inactivity check
    updateActivityTime();
    globalThis.setInterval(checkInactivity, SESSION_TIMEOUT / 2);
}

// Fetch the session timeout value from Odoo settings and then start the session monitoring
rpc("/web/session/get_timeout", {}).then((timeout) => {
    SESSION_TIMEOUT = parseInt(timeout, 10) || SESSION_TIMEOUT;
    startSessionAutoClose();
});
