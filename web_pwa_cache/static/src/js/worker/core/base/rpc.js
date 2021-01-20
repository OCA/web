/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.base.RPC", function (require) {
    "use strict";

    const OdooClass = require("web.Class");

    const OdooRPC = OdooClass.extend({

        /**
         * @param {String} method
         * @param {Object} params
         * @returns {Promise}
         */
        pwaJSonRpc: function (method, params) {
            return this.sendJSonRpc(`web/pwa/${method}`, params);
        },

        /**
         * @param {String} method
         * @param {Object} params
         * @returns {Promise}
         */
        datasetJSonRpc: function (method, params) {
            return this.sendJSonRpc(`web/dataset/${method}`, params);
        },

        /**
         * @param {String} model
         * @param {String} method
         * @param {Array} args
         * @param {Object} kwargs
         * @returns {Promise}
         */
        callJSonRpc: function (model, method, args, kwargs) {
            return this.datasetJSonRpc(`call_kw/${model}/${method}`, {
                args: args || [],
                kwargs: kwargs || {},
                method: method,
                model: model,
            });
        },

        /**
         * @private
         * @param {Object} params
         * @param {String} kw_method
         * @returns {Object}
         */
        _genBody: function (params, kw_method) {
            return {
                id: new Date().getTime(),
                jsonrpc: "2.0",
                method: kw_method,
                params: params || {},
            };
        },

        /**
         * @param {String} endpoint
         * @param {Object} params
         * @param {String} kw_method
         * @returns {Promise[Array]}
         */
        sendJSonRpc: function (endpoint, params, kw_method = "call") {
            return new Promise(async (resolve, reject) => {
                const body = this._genBody(params, kw_method);
                try {
                    const response = await this.sendJSon(endpoint, {
                        body: JSON.stringify(body),
                    });
                    return resolve([response, body]);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} endpoint
         * @param {Object} options
         * @returns {Promise}
         */
        sendJSon: function (endpoint, options) {
            return this.post(
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
        },

        /**
         * @param {String} endpoint
         * @param {Object} options
         * @returns {Promise}
         */
        post: function (endpoint, options) {
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
        },
    });

    return OdooRPC;

});
