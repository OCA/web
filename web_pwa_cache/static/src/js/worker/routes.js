/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.routes", function (require) {
    "use strict";

    const PWA = require("web_pwa_oca.PWA");
    require("web_pwa_cache.PWA");
    const tools = require("web_pwa_cache.PWA.core.base.Tools");
    const ComponentExporter = require("web_pwa_cache.PWA.components.Exporter");
    const ComponentImporter = require("web_pwa_cache.PWA.components.Importer");


    PWA.include({
        _routes: {
            post: {
                // Client -> Odoo (exporter)
                out: {
                    "/web/webclient/version_info": "_routeOutVersionInfo",
                    "/longpolling/poll": "_routeOutLongPolling",
                    "/web/dataset/call_button": "_routeOutDatasetCallButton",
                    "/web/dataset/call_kw/": "_routeOutDatasetCallKW",
                    "/web/dataset/call/": "_routeOutDatasetCallKW",
                    "/web/action/load": "_routeOutActionLoad",
                    "/web/dataset/search_read": "_routeOutDatasetSearchRead",
                    "/web/webclient/translations": "_routeOutTranslations",
                    "/report/check_wkhtmltopdf": "_routeOutCheckWkhtmlToPdf",
                    "/web/action/run": "_routeOutActionRun",
                },
                // Client <- Odoo (importer)
                in: {
                    "/web/dataset/call_kw": "_routeInDatasetCallKW",
                    "/web/dataset/search_read": "_routeInDatasetSearchRead",
                    "/web/action/load": "_routeInActionLoad",
                    "/web/webclient/translations": "_routeInTranslations",
                },
            },
            // Get requests are only for Client -> Odoo (exporter)
            // For Client <- Odoo use browser API
            get: {
                "/web/image": "_routeOutWebImage",
            }
        },

        /**
         * POST OUT ROUTES
         */

        /**
         * Odoo uses this endpoint when try to check the network, so
         * we reply that all is working (only need a 200 reply).
         *
         * @private
         * @returns {Promise[Response]}
         */
        _routeOutVersionInfo: function () {
            return Promise.resolve(tools.ResponseJSONRPC({}));
        },

        /**
         * Handle model method calls requests
         *
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise[Response]}
         */
        _routeOutDatasetCallKW: function (url, request_data) {
            return new Promise(async (resolve, reject) => {
                const pathname_parts = url.pathname.split("/");
                const model = pathname_parts[4];
                const method_name = pathname_parts[5];
                console.log("----- CHECK OUYT!", method_name);
                if (ComponentExporter.prototype.hasOwnProperty(method_name)) {
                    try {
                        const resp_data = await this._components.exporter[method_name](
                            model,
                            request_data.params
                        );
                        return resolve(tools.ResponseJSONRPC(resp_data));
                    } catch (err) {
                        return reject(err);
                    }
                }
                // Try generic way
                try {
                    const resp_data = await this._components.exporter._generic_function(
                        model,
                        method_name,
                        request_data.params
                    );
                    if (resp_data) {
                        return resolve(tools.ResponseJSONRPC(resp_data.result));
                    }
                    return reject();
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Handle buttons method calls requests
         *
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise[Response]}
         */
        _routeOutDatasetCallButton: function (url, request_data) {
            return new Promise(async (resolve) => {
                const model = request_data.params.model;
                const method_name = request_data.params.method;
                if (ComponentExporter.prototype.hasOwnProperty(method_name)) {
                    try {
                        const resp_data = await this._components.exporter[method_name](
                            model,
                            request_data.params,
                        );
                    } catch (err) {
                        // Do Nothing
                    }
                }

                return resolve(tools.ResponseJSONRPC(false));
            });
        },

        /**
         * Reply to Odoo that doesn't exists new longpolling notifications.
         * Wait for the reply is important to be nice with the cpu :)
         *
         * @private
         * @returns {Promise[Response]}
         */
        _routeOutLongPolling: function () {
            return new Promise((resolve) => {
                setTimeout(() => resolve(tools.ResponseJSONRPC([])), 30000);
            });
        },

        /**
         * Odoo uses this endpoint to get the action definition.
         * We reply with a cached one
         *
         * @private
         * @param {String} url
         * @param {Object} data
         * @return {Promise[Response]}
         */
        _routeOutActionLoad: function (url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.action_load(request_data.params);
                    if (resp_data) {
                        return resolve(tools.ResponseJSONRPC(resp_data));
                    }
                } catch (err) {
                    return reject(err);
                }
                return reject();
            });
        },

        /**
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise[Response]}
         */
        _routeOutDatasetSearchRead: function (url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.search_read(
                        false,
                        request_data.params
                    );
                    return resolve(tools.ResponseJSONRPC(resp_data));
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @returns {Promise[Response]}
         */
        _routeOutTranslations: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.translations();
                    return resolve(tools.ResponseJSONRPC(resp_data.value));
                } catch (err) {
                    return reject();
                }
            });
        },

        /**
         * @private
         * @returns {Promise[Response]}
         */
        _routeOutCheckWkhtmlToPdf: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.check_wkhtml_to_pdf();
                    return resolve(tools.ResponseJSONRPC(resp_data.value));
                } catch (err) {
                    return reject();
                }
            });
        },

        /**
         * @private
         * @returns {Promise[Response]}
         */
        _routeOutActionRun: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.action_run();
                    return resolve(tools.ResponseJSONRPC(resp_data.value));
                } catch (err) {
                    return reject();
                }
            });
        },

        /**
         * Cache Generic Post Requests
         *
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise[Response]}
         */
        _routeOutGenericPost: function (url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const post_cache = await this._components.exporter._generic_post(
                        url.pathname,
                        request_data.params
                    );
                    if (post_cache) {
                        return resolve(tools.ResponseJSONRPC(post_cache.result));
                    } else {
                        return reject();
                    }
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * POST IN ROUTES
         */

        /**
         * Cache model method call replies.
         *
         * @private
         * @param {String} url
         * @param {Object} response_data
         * @returns {Promise}
         */
        _routeInDatasetCallKW: function (url, response_data, request_data) {
            const pathname_parts = url.pathname.split("/");
            const model = pathname_parts[4];
            const method_name = pathname_parts[5];
            if (ComponentImporter.prototype.hasOwnProperty(method_name)) {
                this._components.importer[method_name](
                    model,
                    response_data.result,
                    request_data.params
                );
            } else {
                this._components.importer._generic_function(
                    model,
                    method_name,
                    response_data.result,
                    request_data.params
                );
            }
            return Promise.resolve();
        },

        /**
         * Cache search_read calls
         *
         * @private
         * @param {String} url
         * @param {Object} response_data
         * @returns {Promise}
         */
        _routeInDatasetSearchRead: function (url, response_data, request_data) {
            const model = request_data.params.model;
            this._components.importer.search_read(
                model,
                response_data.result,
                request_data.params.domain
            );
            return Promise.resolve();
        },

        /**
         * Cache action_load calls
         *
         * @private
         * @param {String} url
         * @param {Object} response_data
         * @returns {Promise}
         */
        _routeInActionLoad: function (url, response_data) {
            this._components.importer.action_load(response_data.result);
            return Promise.resolve();
        },

        /**
         * @private
         * @param {String} url
         * @param {Object} response_data
         * @returns {Promise}
         */
        _routeInTranslations: function (url, response_data) {
            this._components.importer.translations(response_data.result);
            return Promise.resolve();
        },

        /**
         * Cache Generic Post Requests
         *
         * @private
         * @param {String} url
         * @param {Object} response_data
         * @param {Object} request_data
         * @returns {Promise}
         */
        _routeInGenericPost: function (url, response_data, request_data) {
            this._components.importer._generic_post(
                url.pathname,
                request_data.params,
                response_data.result
            );
            return Promise.resolve();
        },

        /**
         * GET REQUESTS
         */
        /**
         * @private
         * @param {String} url
         * @returns {Promise}
         */
        _routeOutWebImage: function (url) {
            return new Promise(async (resolve, reject) => {
                const pathname_parts = url.pathname.split("/");
                const model = pathname_parts[3];
                const obj_id = pathname_parts[4];
                const field_name = pathname_parts[5];
                const search_params = this._getURLSearchParams(url.search);
                try {
                    const data = await this._components.exporter.web_image(model, obj_id, field_name, search_params);
                    return resolve(tools.ResponseImage(data));
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         *
         * @param {String} search
         * @returns {Object}
         */
        _getURLSearchParams: function (search) {
            const criterias = search.substr(1).split("&");
            const params = {};
            for (const criteria of criterias) {
                const criteria_parts = criteria.split("=");
                if (!criteria_parts[1]) {
                    continue;
                }
                params[criteria_parts[0]] = criteria_parts[1];
            }
            return params;
        }
    });

});
