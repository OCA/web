"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

const OdooRPC = OdooClass.extend({
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
        return new Promise(async (resolve) => {
            const body = this._genBody(params, kw_method);
            return resolve([
                await this.sendJSon(endpoint, {
                    body: JSON.stringify(body),
                }),
                body,
            ]);
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
