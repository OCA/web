/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Prefetch", function(require) {
    "use strict";

    const SWImporterComponent = require("web_pwa_cache.PWA.components.Importer");
    const Tools = require("web_pwa_cache.PWA.core.base.Tools");
    const rpc = require("web_pwa_cache.PWA.core.base.rpc");

    const SWPrefetchComponent = SWImporterComponent.extend({
        _search_read_chunk_size: 500,

        // This is used to force a field type
        _conversion_model_db_types: {
            "pwa.cache.onchange.value": {
                values: "json",
                result: "json",
                ref_hash: "integer",
            },
        },
        // This is used to create indexes
        _table_indexes: {
            "pwa.cache": [
                ["pwa_cache_onchange_field_name_model_name_cache_type", ["onchange_field_name", "model_name", "cache_type"], false],
                //["onchange_model_value_ids", ["model", "value_ids"], true],
            ],
            "pwa.cache.onchange": [
                ["onchange_pwa_cache_id", ["pwa_cache_id"], false],
                //["onchange_model_value_ids", ["model", "value_ids"], true],
            ],
            "pwa.cache.onchange.value": [
                // ["onchange_selector_value_field_name_value", ["field_name", "value"], false],
                // ["onchange_selector_value_onchange_id", ["onchange_id"], false],
                ["onchange_value_ref_hash", ["ref_hash"], true],
                //["onchange_value_onchange_id_field_name_values", ["onchange_id", "field_name", "values"], true],
                // ["onchange_selector_value_onchange_id_field_name_value", ["onchange_id", "field_name", "value"], true],
            ],
        },

        init: function() {
            this._super.apply(this, arguments);
            this.options.allow_create = true;
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
            /**
             * FIXME: This cause a dependecy with "bus.js"
             */
            this.getParent().postBroadcastMessage({
                type: "PREFETCH_MODAL_TASK_INFO",
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
            this._sendTaskInfo(id, "Complete!", 0, 0, true);
        },

        /**
         * Wrapper to send completed task info
         *
         * @param {Number} id
         * @param {String} message
         */
        _sendTaskInfoError: function(id, message) {
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

                // console.log("---- PWA TEST");
                // const rrr = await this._db.sqlitedb
                //     .getDB()
                //     .all(["SELECT * FROM "," LIMIT 10"], this._db.sqlitedb.getDB().raw`pwa_cache_onchange_value`);
                // console.table(rrr);

                // const rrrd = await this._db.sqlitedb
                //     .getDB()
                //     .all(["SELECT * FROM "," WHERE ref_hash="], this._db.sqlitedb.getDB().raw`pwa_cache_onchange_value`, 3646884027832);
                // console.table(rrrd);

                // const rrrt = await this._db.sqlitedb
                //     .getDB()
                //     .all(["EXPLAIN QUERY PLAN SELECT * FROM "," WHERE ref_hash="], this._db.sqlitedb.getDB().raw`pwa_cache_onchange_value`, 3646884027832);
                // console.table(rrrt);

                try {
                    this._processedModels = [];
                    const model_infos = await this.prefetchModelInfoData();
                    await Promise.all([
                        this.prefetchModelData(),
                        this.prefetchModelDefaultData(),
                        this.prefetchViewData(model_infos),
                        this.prefetchActionData(),
                        this.prefetchClientQWebData(),
                        this.prefetchPostData(),
                        this.prefetchUserData(),
                        this.prefetchFunctionData(),
                    ]);
                    await this.runVacuumRecords();
                } catch (err) {
                    return reject(err);
                }

                this.options.force_client_show_modal = false;
                return resolve();
            });
        },

        /**
         * @returns {Promise}
         */
        runVacuumRecords: function() {
            return new Promise(async resolve => {
                try {
                    const models = await this._db.getModelInfo();
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
         * @param {Array} proc_records
         * @param {Boolean} avoid_save
         * @returns {Promise}
         */
        prefetchModelRecords: function(model_info_extra, proc_records, avoid_save) {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = Tools.DateToOdooFormat(new Date());
                const client_message_id = `model_records_${model_info_extra.model.replace(/\./g,"__")}`;
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
                const record_ids = (await response_s.json()).result;
                do {
                    this._sendTaskInfo(
                        client_message_id,
                        `Getting records of the model '${model_info_extra.name}'...`,
                        model_info_extra.count,
                        offset
                    );
                    try {
                        // Get current records
                        const [response, request_data] = await rpc.pwaJSonRpc(
                            "browse_read",
                            {
                                ids: record_ids.slice(
                                    offset,
                                    offset + this._search_read_chunk_size
                                ),
                                model: model_info_extra.model,
                                fields: false,
                                context: {strict_mode: true},
                            },
                        );
                        const response_data = await response.json();
                        if (response_data.result.length === 0) {
                            break;
                        }
                        if (proc_records) {
                            proc_records.push(...response_data.result);
                        }
                        if (!avoid_save) {
                            const model = request_data.params.model;
                            const records = response_data.result;
                            for (let index=response_data.result.length-1; index>=0; --index) {
                                const record = response_data.result[index];
                                await this.search_read(
                                    model,
                                    [record],
                                    request_data.params.domain
                                );
                                this._sendTaskInfo(
                                    client_message_id,
                                    `Getting records of the model '${model_info_extra.name}'...`,
                                    model_info_extra.count,
                                    offset + (records.length - index)
                                );
                            }
                        }
                        offset += response_data.result.length;
                    } catch (err) {
                        this._sendTaskInfoError(
                            client_message_id,
                            `Can't get records of the model ${model_info_extra.name}`
                        );
                        return reject(err);
                    }
                } while (1);

                this._sendTaskInfoCompleted(client_message_id);
                this._db.sqlitedb.updateModelInfo([model_info_extra.id], {
                    prefetch_last_update: start_prefetch_date,
                });

                return resolve(offset);
            });
        },

        /**
         * @returns {Promise}
         */
        prefetchModelData: function() {
            return new Promise(async (resolve, reject) => {
                // Get lastest updates
                let model_infos = await this._db.getModelInfo();
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
                    model_infos = await this._db.getModelInfo(model_names);
                    for (const to_search of to_search_infos) {
                        const model_info = _.findWhere(model_infos, {
                            model: to_search.model,
                        });
                        const model_info_extra = _.extend({}, model_info, to_search);
                        await this.prefetchModelRecords(model_info_extra);
                    }
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
                        `Getting all model's informations...`,
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
                    model_infos = response_data.result || [];
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
         * @param {Array} model_infos
         * @returns {Promise}
         */
        prefetchViewData: function(model_infos) {
            return new Promise(async (resolve, reject) => {
                try {
                    for (const index in model_infos) {
                        const model_info = model_infos[index];
                        this._sendTaskInfo(
                            "prefetch_view_data",
                            `Getting view's information for the model '${model_info.model}'...`,
                            model_infos.length,
                            index
                        );

                        for (const view_type in model_info.view_types) {
                            const ids = model_info.view_types[view_type];
                            for (const id of ids) {
                                try {
                                    const [
                                        response,
                                    ] = await rpc.callJSonRpc(
                                        model_info.model,
                                        "fields_view_get",
                                        [id, view_type, view_type !== "search"]
                                    );
                                    const fields_view = (await response.json()).result;
                                    if (!fields_view) {
                                        continue;
                                    }
                                    this.saveViews(fields_view);
                                } catch (err) {
                                    console.log(
                                        `[ServiceWorker] Can't get view info for ${model_info.model} -> ${id}`
                                    );
                                    console.log(err);
                                }
                            }
                        }
                    }
                    this._sendTaskInfoCompleted("prefetch_view_data");
                } catch (err) {
                    this._sendTaskInfoError(
                        "prefetch_view_data",
                        "Can't get views infos"
                    );
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
                            await this.action_load(response_s_data);
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
                            const [
                                response_s,
                                request_data_s,
                            ] = await rpc.sendJSonRpc(
                                post_def.url,
                                post_def.params || {}
                            );
                            const response_s_data = await response_s.json();
                            await this._generic_post(
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
                                    return: func.result,
                                })
                            );
                        }
                        await Promise.all(tasks);
                    }
                } catch (err) {
                    this._sendTaskInfoError(
                        "onchange_data",
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
                            await this.read_template(false, response_s_data, {
                                args: [xml_ref],
                            });
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
                    await this.load_menus(false, response_data);
                    await this._config.set(
                        "prefetch_userdata_last_update",
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
         * @param {Object} values
         * @returns {Promise}
         */
        saveModelDefaults: function(values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_defaults = await this._db.getModelInfo("defaults", true);
                    await this._db.sqlitedb.createOrUpdateRecord(
                        model_info_defaults,
                        values,
                        false
                    );
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * @param {Object} values
         * @returns {Promise}
         */
        saveViews: function(values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_views = await this._db.getModelInfo("views", true);
                    await this._db.sqlitedb.createOrUpdateRecord(
                        model_info_views,
                        values,
                        ["model", "view_id", "type", "is_default"]
                    );
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * @param {Object} values
         * @returns {Promise}
         */
        saveFunctionData: function(values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_function = await this._db.getModelInfo("function", true);
                    await this._db.sqlitedb.createOrUpdateRecord(
                        model_info_function,
                        values,
                        ["model", "method", "params"]
                    );
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },
    });

    return SWPrefetchComponent;
});
