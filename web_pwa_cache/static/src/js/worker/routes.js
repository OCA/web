/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.routes", function(require) {
    "use strict";

    const PWA = require("web_pwa_oca.PWA");
    require("web_pwa_cache.PWA");
    const Tools = require("web_pwa_cache.PWA.core.base.Tools");

    PWA.include({
        _routes: {
            post: {
                // Client -> Odoo (exporter)
                out: {
                    "/web/webclient/version_info": "_routeOutVersionInfo",
                    "/longpolling/poll": "_routeOutLongPolling",
                    "/longpolling/im_status": "_routeOutLongIMStatus",
                    "/web/dataset/call_button": "_routeOutDatasetCallButton",
                    "/web/dataset/call_kw/": "_routeOutDatasetCallKW",
                    "/web/dataset/call/": "_routeOutDatasetCallKW",
                    "/web/action/load": "_routeOutActionLoad",
                    "/web/dataset/search_read": "_routeOutDatasetSearchRead",
                    "/report/check_wkhtmltopdf": "_routeOutCheckWkhtmlToPdf",
                    "/web/action/run": "_routeOutActionRun",
                    "/mail/init_messaging": "_routeOutInitMessaging",
                    "/mail/read_followers": "_routeOutReadFollowers",
                    "/pwa/sw/config": "_routeOutPWAConfigMessage",
                },
                // Client <- Odoo (importer)
                in: {
                    "/web/dataset/call_kw": "_routeInDatasetCallKW",
                    "/web/dataset/search_read": "_routeInDatasetSearchRead",
                    "/web/action/load": "_routeInActionLoad",
                },
            },
            // Get requests are only for Client -> Odoo (exporter)
            // For Client <- Odoo use native cache API
            get: {
                "/web/image": "_routeOutWebImage",
            },
        },

        /**
         * POST OUT ROUTES
         */

        /**
         * Odoo uses this endpoint when try to check the network, so
         * we reply that all is working (only need a 200 reply).
         *
         * @private
         * @returns {Promise}
         */
        _routeOutVersionInfo: function() {
            if (this._managers.config.isOfflineMode()) {
                return Promise.resolve(Tools.ResponseJSONRPC({}));
            }
            return Promise.reject();
        },

        /**
         * Handle model method calls requests
         *
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise}
         */
        _routeOutDatasetCallKW: function(url, request_data) {
            return new Promise(async (resolve, reject) => {
                const pathname_parts = url.pathname.split("/");
                const model = pathname_parts[4];
                const method_name = pathname_parts[5];
                if (method_name in this._components.exporter) {
                    try {
                        const resp_data = await this._components.exporter[method_name](
                            model,
                            request_data.params
                        );
                        return resolve(Tools.ResponseJSONRPC(resp_data));
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
                        return resolve(Tools.ResponseJSONRPC(resp_data));
                    }
                } catch (err) {
                    return reject(err);
                }

                return reject();
            });
        },

        /**
         * Handle buttons method calls requests
         *
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise}
         */
        _routeOutDatasetCallButton: function(url, request_data) {
            return new Promise(async resolve => {
                const model = request_data.params.model;
                const method_name = request_data.params.method;
                if (method_name in this._components.exporter) {
                    try {
                        await this._components.exporter[method_name](
                            model,
                            request_data.params
                        );
                    } catch (err) {
                        // Do Nothing
                    }
                }

                return resolve(Tools.ResponseJSONRPC(false));
            });
        },

        /**
         * Reply to Odoo that doesn't exists new longpolling notifications.
         * Wait for the reply is important to be nice with the cpu :)
         *
         * @private
         * @returns {Promise}
         */
        _routeOutLongPolling: function() {
            return new Promise((resolve, reject) => {
                if (this._managers.config.isOfflineMode()) {
                    setTimeout(() => resolve(Tools.ResponseJSONRPC([])), 30000);
                } else {
                    reject("Not using simulated response in online mode");
                }
            });
        },

        /**
         * Reply to Odoo that doesn't exists any.
         * Wait for the reply is important to be nice with the cpu :)
         *
         * @private
         * @returns {Promise}
         */
        _routeOutLongIMStatus: function() {
            if (this._managers.config.isOfflineMode()) {
                return Promise.resolve(
                    Tools.ResponseJSONRPC({
                        id: this._managers.config.getUID(),
                        im_status: "offline",
                    })
                );
            }
            return Promise.reject("Not using simulated response in online mode");
        },

        /**
         * Odoo uses this endpoint to get the action definition.
         * We reply with a cached one
         *
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise}
         */
        _routeOutActionLoad: function(url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.action_load(
                        request_data.params
                    );
                    if (resp_data) {
                        return resolve(Tools.ResponseJSONRPC(resp_data));
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
         * @returns {Promise}
         */
        _routeOutDatasetSearchRead: function(url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.search_read(
                        false,
                        request_data.params
                    );
                    return resolve(Tools.ResponseJSONRPC(resp_data));
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @returns {Promise}
         */
        _routeOutCheckWkhtmlToPdf: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.check_wkhtml_to_pdf();
                    return resolve(Tools.ResponseJSONRPC(resp_data.value));
                } catch (err) {
                    return reject();
                }
            });
        },

        /**
         * @private
         * @returns {Promise}
         */
        _routeOutActionRun: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp_data = await this._components.exporter.action_run();
                    return resolve(Tools.ResponseJSONRPC(resp_data.value));
                } catch (err) {
                    return reject();
                }
            });
        },

        /**
         * @private
         * @returns {Promise}
         */
        _routeOutInitMessaging: function() {
            if (this._managers.config.isOfflineMode()) {
                return Promise.resolve(
                    Tools.ResponseJSONRPC({
                        id: this._managers.config.getUID(),
                        im_status: "offline",
                    })
                );
            }
            return Promise.reject("Not using simulated response in online mode");
        },

        _routeOutReadFollowers: function(url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (this._managers.config.isOfflineMode()) {
                        const resp_data = await this._components.exporter.read_followers(
                            request_data.params.res_model,
                            request_data.params.follower_ids
                        );
                        return resolve(Tools.ResponseJSONRPC(resp_data));
                    }
                    return reject("Not using simulated response in online mode");
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Cache Generic Post Requests
         *
         * @private
         * @param {String} url
         * @param {Object} request_data
         * @returns {Promise}
         */
        _routeOutGenericPost: function(url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const post_cache = await this._components.exporter._generic_post(
                        url.pathname,
                        request_data.params
                    );
                    if (post_cache) {
                        return resolve(Tools.ResponseJSONRPC(post_cache));
                    }
                    return reject();
                } catch (err) {
                    return reject(err);
                }
            });
        },

        _routeOutPWAConfigMessage: function(url, request_data) {
            return new Promise(async (resolve, reject) => {
                try {
                    await this._managers.config.onProcessMessage(request_data);
                } catch (err) {
                    return reject(err);
                }

                return resolve(Tools.ResponseJSONRPC({}));
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
         * @param {Object} request_data
         * @returns {Promise}
         */
        _routeInDatasetCallKW: function(url, response_data, request_data) {
            const pathname_parts = url.pathname.split("/");
            const model = pathname_parts[4];
            const method_name = pathname_parts[5];
            if (method_name in this._components.importer) {
                this._components.importer[method_name](
                    model,
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
         * @param {Object} request_data
         * @returns {Promise}
         */
        _routeInDatasetSearchRead: function(url, response_data, request_data) {
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
        _routeInActionLoad: function(url, response_data) {
            this._components.importer.action_load(response_data.result);
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
        _routeInGenericPost: function(url, response_data, request_data) {
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
        _routeOutWebImage: function(url) {
            return new Promise(async (resolve, reject) => {
                const pathname_parts = url.pathname.split("/");
                const model = pathname_parts[3];
                const obj_id = pathname_parts[4];
                const field_name = pathname_parts[5];
                const search_params = this._getURLSearchParams(url.search);
                try {
                    const data = await this._components.exporter.web_image(
                        model,
                        obj_id,
                        field_name,
                        search_params
                    );
                    if (!_.isEmpty(data)) {
                        return resolve(Tools.ResponseImage(data));
                    } else if (this._managers.config.isOfflineMode()) {
                        return resolve(
                            Tools.ResponseRedirect(
                                "/web/static/src/img/placeholder.png"
                            )
                        );
                    }
                } catch (err) {
                    return reject(err);
                }

                return reject(
                    "Cached image not found, fallback to default browser behaviour"
                );
            });
        },

        /**
         *
         * @param {String} search
         * @returns {Object}
         */
        _getURLSearchParams: function(search) {
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
        },
    });
});
