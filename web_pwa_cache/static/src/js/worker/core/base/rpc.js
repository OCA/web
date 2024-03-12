/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.base.rpc", function() {
    "use strict";

    /**
     * @param {String} endpoint
     * @param {Object} options
     * @returns {Promise}
     */
    function post(endpoint, options) {
        return fetch(
            endpoint,
            _.extend(
                {
                    credentials: "include",
                    method: "POST",
                },
                options
            )
        );
    }

    /**
     * @param {String} endpoint
     * @param {Object} options
     * @returns {Promise}
     */
    function sendJSon(endpoint, options) {
        return post(
            endpoint,
            _.extend(
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                },
                options
            )
        );
    }

    /**
     * @private
     * @param {Object} params
     * @param {String} kw_method
     * @returns {Object}
     */
    function _genBody(params, kw_method) {
        return {
            id: new Date().getTime(),
            jsonrpc: "2.0",
            method: kw_method,
            params: params || {},
        };
    }

    /**
     * @param {String} endpoint
     * @param {Object} params
     * @param {String} kw_method
     * @returns {Promise}
     */
    function sendJSonRpc(endpoint, params, kw_method = "call") {
        return new Promise(async (resolve, reject) => {
            const body = _genBody(params, kw_method);
            try {
                const response = await sendJSon(endpoint, {
                    body: JSON.stringify(body),
                });
                return resolve([response, body]);
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @param {String} method
     * @param {Object} params
     * @returns {Promise}
     */
    function pwaJSonRpc(method, params) {
        return sendJSonRpc(`web/pwa/${method}`, params);
    }

    /**
     * @param {String} method
     * @param {Object} params
     * @returns {Promise}
     */
    function datasetJSonRpc(method, params) {
        return sendJSonRpc(`web/dataset/${method}`, params);
    }

    /**
     * @param {String} model
     * @param {String} method
     * @param {Array} args
     * @param {Object} kwargs
     * @returns {Promise}
     */
    function callJSonRpc(model, method, args, kwargs) {
        return datasetJSonRpc(`call_kw/${model}/${method}`, {
            args: args || [],
            kwargs: kwargs || {},
            method: method,
            model: model,
        });
    }

    return {
        pwaJSonRpc: pwaJSonRpc,
        datasetJSonRpc: datasetJSonRpc,
        callJSonRpc: callJSonRpc,
        sendJSonRpc: sendJSonRpc,
        sendJSon: sendJSon,
        post: post,
    };
});
