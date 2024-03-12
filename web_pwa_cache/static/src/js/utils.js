/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_cache.Utils", function() {
    "use strict";

    /**
     * @private
     * @param {String} url
     * @param {Oject} data
     * @returns {Promise}
     */
    function sendJSON(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: resolve,
                error: reject,
            });
        });
    }

    return {
        sendJSON: sendJSON,
    };
});
