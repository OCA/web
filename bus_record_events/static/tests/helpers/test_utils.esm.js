/** @odoo-module */

const DEBOUNCE_WAIT = 300;

export const waitForDebounce = () =>
    new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT));
