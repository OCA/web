/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Prefetch", function(require) {
    "use strict";

    const SWComponent = require("web_pwa_cache.PWA.components.Component");
    const Tools = require("web_pwa_cache.PWA.core.base.Tools");
    const rpc = require("web_pwa_cache.PWA.core.base.rpc");

    const SWPrefetchComponent = SWComponent.extend({
        _search_read_chunk_size: 500,
        _search_read_onchange_value_chunk_size: 8000,

        // This is used to force a field type
        _conversion_model_db_types: {
            "pwa.cache.onchange.value": {
                pwa_cache_id: "integer",
                result: "serialized",
                ref_hash: "integer",
            },
        },
        // This is used to create indexes
        _table_indexes: {
            "pwa.cache": [
                [
                    "pwa_cache_onchange_field_name_model_name_cache_type",
                    ["onchange_field_name", "model_name", "cache_type"],
                    false,
                ],
            ],
            "pwa.cache.onchange": [
                [
                    "onchange_pwa_cache_id_disposable",
                    ["pwa_cache_id", "disposable"],
                    false,
                ],
            ],
            "res.partner": [
                [
                    "res_partner_display_name_company_id",
                    ["display_name", "company_id"],
                    false,
                ],
            ],
            "product.product": [
                [
                    "res_partner_display_name_sale_ok",
                    ["display_name", "sale_ok"],
                    false,
                ],
            ],
        },

        init: function() {
            this._super.apply(this, arguments);
            this.options = {
                force_client_show_modal: false,
            };
            this._verbose = false;
        },

        /**
         * Wrapper to send task info
         *
         * @param {String} id
         * @param {String} message
         * @param {Number} count_total
         * @param {Number} count_done
         * @param {Boolean} completed
         * @param {Boolean} error
         */
        _sendTaskInfo: function(
            id,
            message,
            count_total,
            count_done,
            completed = false,
            error = false
        ) {
            if (!this._verbose) {
                return;
            }
            /**
             * FIXME: This cause a dependecy with "bus.js"
             */
            this.getParent().postBroadcastMessage({
                type: "PWA_PREFETCH_MODAL_TASK_INFO",
                id: id,
                message: message,
                count_total: count_total,
                count_done: count_done,
                error: error,
                completed: completed,
                force_show_modal: this.options.force_client_show_modal,
            });
        },

        /**
         * Wrapper to send completed task info
         *
         * @param {String} id
         */
        _sendTaskInfoCompleted: function(id) {
            if (!this._verbose) {
                return;
            }
            this._sendTaskInfo(id, "Complete!", 0, 0, true);
        },

        /**
         * Wrapper to send completed task info
         *
         * @param {Number} id
         * @param {String} message
         */
        _sendTaskInfoError: function(id, message) {
            if (!this._verbose) {
                return;
            }
            this._sendTaskInfo(id, `Error: ${message}`, -1, 0, false, true);
        },

        /**
         * Helper function
         *
         * @param {Object} model_info
         * @returns {Promise}
         */
        _getModelCount: function(model_info) {
            return new Promise(async (resolve, reject) => {
                let count = 0;
                let domain_forced = [];
                if (model_info.prefetch_last_update) {
                    domain_forced = [
                        ["write_date", ">=", model_info.prefetch_last_update],
                    ];
                }
                try {
                    const [response] = await rpc.callJSonRpc(
                        model_info.model,
                        "search_count",
                        [_.union(domain_forced, model_info.domain)]
                    );
                    const response_data = await response.json();
                    count = response_data.result;
                } catch (err) {
                    return reject(err);
                }

                return resolve(count);
            });
        },

        /**
         * @private
         * @param {String} cache_name
         * @param {Array} prefetched_urls
         * @returns {Promise}
         */
        prefetchDataGet: function(cache_name, prefetched_urls) {
            // Prefetch URL's
            return this._cache.get(cache_name).addAll(prefetched_urls);
        },

        /**
         * Launch all prefetch process
         *
         * @returns {Promise}
         */
        prefetchDataPost: function() {
            return new Promise(async (resolve, reject) => {
                this.options.force_client_show_modal = true;
                this._verbose = true;

                try {
                    const model_metadata_promise = this.prefetchModelInfoData();
                    await Promise.all([
                        model_metadata_promise.then(() => this.prefetchModelData()),
                        this.prefetchOnchange(),
                        this.prefetchModelDefaultData(),
                        this.prefetchActionData(),
                        this.prefetchClientQWebData(),
                        this.prefetchPostData(),
                        this.prefetchUserData(),
                        this.prefetchFunctionData(),
                        this.prefetchViewData(),
                    ]);
                    await this.runVacuumRecords();
                    await this._db.persistDatabases();
                } catch (err) {
                    return reject(err);
                }

                // Const model_info = await this._db.getModelInfo("res.groups");
                // const records = await this._db.search_read(model_info, []);
                // console.log("------------------ RECORDS");
                // console.log(records);

                this.options.force_client_show_modal = false;
                this._verbose = false;
                return resolve();
            });
        },

        /**
         * @returns {Promise}
         */
        runVacuumRecords: function() {
            return new Promise(async resolve => {
                try {
                    this._sendTaskInfo("vacuum_records", `Vacuum records...`, -1, 0);
                    const models = await this._db.getModelInfo(
                        false,
                        false,
                        false,
                        true
                    );
                    const num_models = models.length;
                    for (const index in models) {
                        const model_info = models[index];
                        if (
                            model_info.internal ||
                            this._processedModels.indexOf(model_info.model) === -1
                        ) {
                            continue;
                        }
                        this._sendTaskInfo(
                            "vacuum_records",
                            `Vacuum records of the model '${model_info.model}'...`,
                            num_models,
                            index
                        );
                        try {
                            const [response] = await rpc.callJSonRpc(
                                model_info.model,
                                "search",
                                [model_info.domain]
                            );
                            const response_data = (await response.json()).result;
                            await this._db.vacuumRecords(
                                model_info.model,
                                response_data
                            );
                        } catch (err) {
                            // Do nothing
                        }
                    }
                } catch (err) {
                    // Do nothing
                }
                this._sendTaskInfoCompleted("vacuum_records");
                return resolve();
            });
        },

        /**
         * Create tables in db
         *
         * @param {Array} model_infos
         * @returns {Promise}
         */
        createTables: function(model_infos) {
            var tasks = [];
            for (const model_info of model_infos) {
                tasks.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            await this._db.sqlitedb.createTable(model_info);
                            await this._postProcessTable(model_info);
                        } catch (err) {
                            return reject(err);
                        }
                        return resolve();
                    })
                );
            }

            return Promise.all(tasks);
        },

        /**
         * @param {Object} model_info_extra
         * @param {String} client_message_id
         * @returns {Promise}
         */
        prefetchModelRecords: function(model_info_extra, client_message_id) {
            return new Promise(async (resolve, reject) => {
                let offset = 0;
                let domain_forced = [];
                if (model_info_extra.prefetch_last_update) {
                    domain_forced = [
                        ["write_date", ">=", model_info_extra.prefetch_last_update],
                    ];
                }
                const domain = _.union(domain_forced, model_info_extra.domain);
                // Get ids
                const [response_s] = await rpc.callJSonRpc(
                    model_info_extra.model,
                    "search",
                    [domain]
                );
                const chunk_size =
                    model_info_extra.model === "pwa.cache.onchange.value"
                        ? this._search_read_onchange_value_chunk_size
                        : this._search_read_chunk_size;

                const record_ids = (await response_s.json()).result;
                do {
                    try {
                        // Get current records
                        const [response] = await rpc.pwaJSonRpc("browse_read", {
                            ids: record_ids.slice(offset, offset + chunk_size),
                            model: model_info_extra.model,
                            fields: false,
                            context: {strict_mode: true},
                        });
                        const response_data = await response.json();
                        if (!response_data || response_data.result.length === 0) {
                            break;
                        }
                        const records = response_data.result;
                        // Save using indexedb, use bulk operations
                        if (model_info_extra.model === "pwa.cache.onchange.value") {
                            await this.saveModelRecords(model_info_extra, records);
                            this._sendTaskInfo(
                                client_message_id,
                                `Getting records of the model '${model_info_extra.name}'...`,
                                model_info_extra.count,
                                offset + records.length
                            );
                        } else {
                            for (let index = records.length - 1; index >= 0; --index) {
                                const record = records[index];
                                await this.saveModelRecords(model_info_extra, [record]);
                                this._sendTaskInfo(
                                    client_message_id,
                                    `Getting records of the model '${model_info_extra.name}'...`,
                                    model_info_extra.count,
                                    offset + (records.length - index)
                                );
                            }
                        }
                        offset += records.length;
                    } catch (err) {
                        this._sendTaskInfoError(client_message_id, err);
                        return reject(err);
                    }
                } while (offset < model_info_extra.count);

                return resolve(offset);
            });
        },

        /**
         * @returns {Promise}
         */
        prefetchModelData: function() {
            return new Promise(async (resolve, reject) => {
                // Get lastest updates
                let model_infos = await this._db.getModelInfo(
                    false,
                    false,
                    false,
                    true
                );
                const prefetch_last_updates = {};
                for (const model_info of model_infos) {
                    if (model_info.prefetch_last_update) {
                        prefetch_last_updates[model_info.model] =
                            model_info.prefetch_last_update;
                    }
                }

                try {
                    const [response] = await rpc.sendJSonRpc("/pwa/prefetch/model", {
                        last_update: prefetch_last_updates,
                    });
                    const response_data = await response.json();
                    const to_search_infos = response_data.result;
                    const model_names = _.map(to_search_infos, "model");
                    model_infos = await this._db.getModelInfo(
                        model_names,
                        false,
                        false,
                        true
                    );
                    for (const to_search of to_search_infos) {
                        const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                        const model_info = _.findWhere(model_infos, {
                            model: to_search.model,
                        });
                        const model_info_extra = _.extend({}, model_info, to_search);
                        const client_message_id = `model_records_${model_info_extra.model.replace(
                            /\./g,
                            "__"
                        )}`;
                        this._sendTaskInfo(
                            client_message_id,
                            `Getting records of the model '${model_info_extra.name}'...`,
                            model_info_extra.count,
                            0
                        );
                        await this.prefetchModelRecords(
                            model_info_extra,
                            client_message_id
                        );
                        this._sendTaskInfoCompleted(client_message_id);
                        this._db.sqlitedb.updateModelInfo([model_info_extra.id], {
                            prefetch_last_update: start_prefetch_date,
                        });
                    }
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        prefetchOnchange: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                    const prefetch_last_update = await this._config.get(
                        "prefetch_onchange_last_update"
                    );
                    const [response] = await rpc.sendJSonRpc(
                        "/pwa/prefetch/model_info_onchange",
                        {
                            last_update: false,
                        }
                    );
                    const response_data = await response.json();
                    const model_infos = response_data.result;
                    const client_message_id =
                        "model_records_pwa__cache__onchange__value";
                    for (const virt_model_info of model_infos) {
                        virt_model_info.prefetch_last_update = prefetch_last_update;
                        virt_model_info.count = await this._getModelCount(
                            virt_model_info
                        );
                        this._sendTaskInfo(
                            client_message_id,
                            `Onchange: '${virt_model_info.name}'...`,
                            virt_model_info.count,
                            0
                        );
                        await this.prefetchModelRecords(
                            virt_model_info,
                            client_message_id
                        );
                    }
                    await this._config.set(
                        "prefetch_onchange_last_update",
                        start_prefetch_date
                    );
                    this._sendTaskInfoCompleted(client_message_id);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * @returns {Promise}
         */
        prefetchModelInfoData: function() {
            return new Promise(async (resolve, reject) => {
                let model_infos = [];
                try {
                    const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                    const prefetch_last_update = await this._config.get(
                        "prefetch_modelinfo_last_update"
                    );
                    this._sendTaskInfo(
                        "model_info_data",
                        `Getting metadata of all models. This operation will take a while, please wait...`,
                        -1,
                        0
                    );
                    const [response] = await rpc.sendJSonRpc(
                        "/pwa/prefetch/model_info",
                        {
                            last_update: prefetch_last_update || false,
                        }
                    );
                    const response_data = await response.json();
                    model_infos = response_data.result;
                    if (!(model_infos instanceof Array)) {
                        this._sendTaskInfoError(
                            "model_info_data",
                            "Can't get model infos"
                        );
                        return reject();
                    }
                    if (!_.isEmpty(model_infos)) {
                        const tasks = [];
                        for (const model_info of model_infos) {
                            tasks.push(this.saveModelInfo(model_info));
                        }
                        await Promise.all(tasks);
                        await this.createTables(model_infos);
                        await this._config.set(
                            "prefetch_modelinfo_last_update",
                            start_prefetch_date
                        );
                    }
                } catch (err) {
                    this._sendTaskInfoError("model_info_data", "Can't get model infos");
                    return reject(err);
                }
                this._sendTaskInfoCompleted("model_info_data");
                return resolve(model_infos);
            });
        },

        /**
         * @returns {Promise}
         */
        prefetchModelDefaultData: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                    const prefetch_last_update = await this._config.get(
                        "prefetch_defaults_last_update"
                    );
                    this._sendTaskInfo(
                        "model_default_data",
                        `Getting model default values formulas...`,
                        -1,
                        0
                    );
                    const [response] = await rpc.sendJSonRpc(
                        "/pwa/prefetch/default_formula",
                        {
                            last_update: prefetch_last_update || false,
                        }
                    );
                    const tasks = [];
                    const records = (await response.json()).result;
                    for (const record of records) {
                        tasks.push(this.saveModelDefaults(record));
                    }
                    await Promise.all(tasks);
                    await this._config.set(
                        "prefetch_defaults_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError(
                        "model_default_data",
                        "Can't get default values formulas of models"
                    );
                    return reject(err);
                }
                this._sendTaskInfoCompleted("model_default_data");
                return resolve();
            });
        },

        /**
         * @returns {Promise}
         */
        prefetchViewData: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                    const prefetch_last_update = await this._config.get(
                        "prefetch_views_last_update"
                    );
                    this._sendTaskInfo(
                        "prefetch_view_data",
                        `Getting views information. This operation will take a while, please wait...`,
                        -1,
                        0
                    );
                    const [response] = await rpc.sendJSonRpc(
                        "/pwa/prefetch/model_view",
                        {
                            last_update: prefetch_last_update || false,
                        }
                    );
                    const records = (await response.json()).result;
                    await this.saveViews(records);
                    await this._config.set(
                        "prefetch_views_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError(
                        "prefetch_view_data",
                        "Can't get views infos"
                    );
                    console.log(`[ServiceWorker] Can't get view infos`);
                    console.log(err);
                    return reject(err);
                }
                this._sendTaskInfoCompleted("prefetch_view_data");
                return resolve();
            });
        },

        /**
         * Prefetch actions:
         *  - Get actions
         *  - Get views
         *  - Get model default values (per view)
         *
         * @private
         * @returns {Promise}
         */
        prefetchActionData: function() {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this._config.get(
                    "prefetch_action_last_update"
                );
                try {
                    this._sendTaskInfo("action_data", `Getting actions...`, -1, 0);
                    // Get prefetching metadata
                    const [response] = await rpc.sendJSonRpc("/pwa/prefetch/action", {
                        last_update: prefetch_last_update || false,
                    });
                    // Prefetch Actions
                    const response_data = (await response.json()).result;
                    if (response_data) {
                        const num_actions = response_data.length + 1;
                        for (const index in response_data) {
                            const action_id = response_data[index];
                            this._sendTaskInfo(
                                "action_data",
                                `Getting info of the action #${action_id}...`,
                                num_actions,
                                index
                            );
                            const [response_s] = await rpc.sendJSonRpc(
                                "/web/action/load",
                                {
                                    action_id: action_id,
                                }
                            );
                            const response_s_data = (await response_s.json()).result;
                            await this.saveAction(response_s_data);
                        }
                    }

                    await this._config.set(
                        "prefetch_action_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError("action_data", "Can't get actions infos");
                    return reject(err);
                }

                this._sendTaskInfoCompleted("action_data");
                return resolve();
            });
        },

        /**
         * Prefetch generic defined post calls
         *
         * @private
         * @returns {Promise}
         */
        prefetchPostData: function() {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this._config.get(
                    "prefetch_post_last_update"
                );
                try {
                    this._sendTaskInfo("post_data", `Getting post results...`, -1, 0);
                    // Get prefetching metadata
                    const [response] = await rpc.sendJSonRpc("/pwa/prefetch/post", {
                        last_update: prefetch_last_update || false,
                    });
                    // Prefetch Posts
                    const response_data = (await response.json()).result;
                    if (response_data) {
                        const num_posts = response_data.length + 1;
                        for (const index in response_data) {
                            const post_def = response_data[index];
                            this._sendTaskInfo(
                                "post_data",
                                `Getting post results of the endpoint '${post_def.url}'...`,
                                num_posts,
                                index
                            );
                            const [response_s, request_data_s] = await rpc.sendJSonRpc(
                                post_def.url,
                                post_def.params || {}
                            );
                            const response_s_data = await response_s.json();
                            await this.saveGenericPost(
                                new URL(response_s.url).pathname,
                                request_data_s.params,
                                response_s_data.result
                            );
                        }
                    }

                    await this._config.set(
                        "prefetch_post_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError("post_data", "Can't get POST results");
                    return reject(err);
                }

                this._sendTaskInfoCompleted("post_data");
                return resolve();
            });
        },

        /**
         * Prefetch function calls values
         *
         * @private
         * @returns {Promise}
         */
        prefetchFunctionData: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    this._sendTaskInfo(
                        "function_data",
                        `Calculating & Getting 'call function' data...`,
                        -1,
                        0
                    );
                    // Get prefetching metadata
                    const [response] = await rpc.sendJSonRpc("/pwa/prefetch/function");
                    const response_data = (await response.json()).result;
                    if (response_data) {
                        const tasks = [];
                        for (const func of response_data) {
                            tasks.push(
                                this.saveFunctionData({
                                    model: func.model,
                                    method: func.method,
                                    params: func.params,
                                    result: func.result,
                                })
                            );
                        }
                        await Promise.all(tasks);
                    }
                } catch (err) {
                    this._sendTaskInfoError(
                        "function_data",
                        "Can't get function results"
                    );
                    return reject(err);
                }

                this._sendTaskInfoCompleted("function_data");
                return resolve();
            });
        },

        /**
         * Prefect widgets views (clientqweb)
         *
         * @private
         * @returns {Promise}
         */
        prefetchClientQWebData: function() {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this._config.get(
                    "prefetch_clientqweb_last_update"
                );
                try {
                    this._sendTaskInfo(
                        "clientqweb_data",
                        `Getting client templates...`,
                        -1,
                        0
                    );
                    // Get prefetching metadata
                    const [response] = await rpc.sendJSonRpc(
                        "/pwa/prefetch/clientqweb",
                        {
                            last_update: prefetch_last_update || false,
                        }
                    );
                    // Prefetch Templates
                    const response_data = (await response.json()).result;
                    if (response_data) {
                        const num_views = response_data.length + 1;
                        for (const index in response_data) {
                            const xml_ref = response_data[index];
                            this._sendTaskInfo(
                                "clientqweb_data",
                                `Getting client template '${xml_ref}'...`,
                                num_views,
                                index
                            );
                            const [response_s] = await rpc.callJSonRpc(
                                "ir.ui.view",
                                "read_template",
                                false,
                                {
                                    xml_id: xml_ref,
                                    context: {lang: this._config.getLang()},
                                }
                            );
                            const response_s_data = (await response_s.json()).result;
                            await this.saveTemplate(xml_ref, response_s_data);
                        }
                    }
                    await this._config.set(
                        "prefetch_clientqweb_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError(
                        "clientqweb_data",
                        "Can't get client qweb templates"
                    );
                    return reject(err);
                }

                this._sendTaskInfoCompleted("clientqweb_data");
                return resolve();
            });
        },

        /**
         * Prefetch User Data
         *
         * @private
         * @returns {Promise}
         */
        prefetchUserData: function() {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                try {
                    this._sendTaskInfo("user_data_menu", "Getting menus...", -1, 0);
                    const [response] = await rpc.callJSonRpc(
                        "ir.ui.menu",
                        "load_menus",
                        ["assets"]
                    );
                    const response_data = (await response.json()).result;
                    await this.saveMenus(response_data);
                    await this._config.set(
                        "prefetch_userdata_menus_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError("user_data_menu", "Can't get user data");
                    return reject(err);
                }

                this._sendTaskInfoCompleted("user_data_menu");
                return resolve();
            });
        },

        /** HELPERS **/

        /**
         *
         * @param {Object} model_info
         * @returns {Promise}
         */
        _postProcessTable: function(model_info) {
            // Create table indexes
            const tasks = [];
            if (model_info.model in this._table_indexes) {
                const indexes = this._table_indexes[model_info.model];
                for (const index_def of indexes) {
                    const [name, fields, unique] = index_def;
                    tasks.push(
                        this._db.sqlitedb.createIndex(model_info, name, fields, unique)
                    );
                }
            }
            return Promise.all(tasks);
        },

        /**
         * @param {Object} values
         * @returns {Object}
         */
        _preProcessModelInfo: function(values) {
            // Remove temporal values
            const n_values = _.omit(values, ["count", "domain", "excluded_fields"]);
            // Change field types if needed
            if (n_values.model in this._conversion_model_db_types) {
                const model_conv_types = this._conversion_model_db_types[
                    n_values.model
                ];
                for (const field in model_conv_types) {
                    n_values.fields[field].type = model_conv_types[field];
                }
            }
            return n_values;
        },

        /**
         * @param {Object} values
         * @returns {Promise}
         */
        saveModelInfo: function(values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_metadata = await this._db.getModelInfo(
                        "model_metadata",
                        true,
                        false,
                        true
                    );

                    await this._db.sqlitedb.createOrUpdateRecord(
                        model_info_metadata,
                        this._preProcessModelInfo(values),
                        ["model"]
                    );
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * @param {Array} records
         * @returns {Promise}
         */
        saveModelDefaults: function(records) {
            return this._db.indexeddb.model_default_formula.bulkPut(records);
        },

        /**
         * @param {Array} records
         * @returns {Promise}
         */
        saveViews: function(records) {
            return this._db.indexeddb.views.bulkPut(records);
        },

        /**
         * @param {Object} values
         * @returns {Promise}
         */
        saveFunctionData: function(values) {
            values.params = Tools.hash(JSON.stringify(values.params));
            return this._db.indexeddb.function.put(values);
        },

        /**
         * @param {Object} model_info
         * @param {Array} records
         * @returns {Promise}
         */
        saveModelRecords: function(model_info, records) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (model_info.model === "pwa.cache.onchange.value") {
                        await this.saveModelRecordsOnchangeValue(records);
                    } else {
                        // WriteOrCreate process "binary" fields that are managed in indexeddb
                        await this._db.writeOrCreate(model_info, records);
                    }
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * Sanitize and save pwa.cache.onchange.value records
         *
         * @param {Array} records
         * @returns {Promise}
         */
        saveModelRecordsOnchangeValue: function(records) {
            for (const record of records) {
                record.pwa_cache_id = record.pwa_cache_id[0];
                record.ref_hash = Number(record.ref_hash);
                record.result = JSON.parse(record.result);
            }
            return this._db.indexeddb.onchange.bulkPut(records);
        },

        /**
         * @param {Any} data
         * @returns {Promise}
         */
        saveMenus: function(data) {
            const values = {
                param: "menus",
                value: data,
            };
            return this._db.indexeddb.userdata.put(values);
        },

        /**
         * @param {String} xml_ref
         * @param {Any} data
         * @returns {Promise}
         */
        saveTemplate: function(xml_ref, data) {
            const values = {
                xml_ref: xml_ref,
                template: data,
            };

            return this._db.indexeddb.template.put(values);
        },

        /**
         * @param {Any} data
         * @returns {Promise}
         */
        saveAction: function(data) {
            return this._db.indexeddb.action.put(data);
        },

        saveGenericPost: function(pathname, params, result) {
            return this._db.indexeddb.post.put({
                pathname: pathname,
                params: Tools.hash(JSON.stringify(params)),
                result: result,
            });
        },
    });

    return SWPrefetchComponent;
});
