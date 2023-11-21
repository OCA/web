/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

/**
 * Helper function to eval text for a given object
 *
 * @param {String} text
 * @param {Object} vals
 * @returns {any}
 */
export const evalOperation = (text, vals) => {
    for (const variable in vals) {
        if (vals.hasOwnProperty(variable)) {
            const regex = new RegExp(variable, "g");
            text = text.replace(regex, vals[variable]);
        }
    }
    try {
        // eslint-disable-next-line no-eval
        const res = eval(text);
        return res;
    } catch (error) {
        console.error("Error trying to eval operation:", error);
        return;
    }
};
