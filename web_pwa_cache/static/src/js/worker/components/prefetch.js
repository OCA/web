/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Prefetch", function (require) {
    "use strict";

    const ComponentImporter = require('web_pwa_cache.PWA.components.Importer');
    const tools = require("web_pwa_cache.PWA.core.base.Tools");

    const ComponentPrefetch = ComponentImporter.extend({

        _search_read_chunk_size: 50,

        init: function () {
            this._super.apply(this, arguments);
            this.options.allow_create = true;
        },

        /**
         * Wrapper to send task info
         *
         * @param {String} id
         * @param {Number} progress
         * @param {String} message
         */
        _sendTaskInfo: function (id, message, count_total, count_done, completed = false, error = false) {
            this.getParent().postClientPageMessage({
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
        _sendTaskInfoCompleted: function (id) {
            this._sendTaskInfo(id, "Completed!", 0, 0, true);
        },


        /**
         * Wrapper to send completed task info
         *
         * @param {String} id
         */
        _sendTaskInfoError: function (id, message) {
            this._sendTaskInfo(id, `Error: ${message}`, -1, 0, false, true);
        },

        /**
         * Helper function
         *
         * @param {Object} model_info
         * @returns {Promise}
         */
        _getModelCount: function (model_info) {
            return new Promise(async (resolve, reject) => {
                let count = 0;
                let domain_forced = [];
                if (model_info.prefetch_last_update) {
                    domain_forced = [
                        ["write_date", ">=", model_info.prefetch_last_update],
                    ];
                }
                try {
                    const [response] = await this._rpc.callJSonRpc(
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
         * @returns {Promise}
         */
        prefetchDataGet: function (cache_name, prefetched_urls) {
            // Prefetch URL's
            return this._cache.get(cache_name).addAll(prefetched_urls);
        },

        /**
         * Launch all prefetch process
         *
         * @returns {Promise}
         */
        prefetchDataPost: function () {
            return new Promise(async (resolve, reject) => {
                this.options.force_client_show_modal = true;
                try {
                    const model_infos = await this.prefetchModelInfoData();
                    await Promise.all([
                        this.prefetchModelData(),
                        this.prefetchModelDefaultData(),
                        this.prefetchViewData(model_infos),
                        this.prefetchActionData(),
                        this.prefetchClientQWebData(),
                        this.prefetchPostData(),
                        this.prefetchUserData(),
                        this.prefetchOnchangeData(),
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
        runVacuumRecords: function () {
            return new Promise(async (resolve) => {
                try {
                    const models = await this._dbmanager.sqlitedb.getModelInfo();
                    const num_models = models.length;

                    for (const index in models) {
                        this._sendTaskInfo(
                            "vacuum_records",
                            `Vacuum records of the model '${model_info.model_name}'...`,
                            num_models,
                            index);
                        try {
                            const [
                                response
                            ] = await this._rpc.callJSonRpc(model_info.model, "search", [
                                model_info.domain,
                            ]);
                            const response_data = (await response.json()).result;
                            await this._dbmanager.vacuumRecords(
                                model_info.model,
                                response_data
                            );
                        } catch (err) {
                            // do nothing
                        }
                    }
                } catch (err) {
                    // do nothing
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
        createTables: function (model_infos) {
            var tasks = [];
            for (let model_info of model_infos) {
                tasks.push(this._dbmanager.sqlitedb.createTable(model_info));
            }
            return Promise.all(tasks);
        },

        /**
         * @param {Object} model_info_extra
         * @returns {Promise}
         */
        prefetchModelRecords: function (model_info_extra, proc_records, avoid_save) {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = tools.DateToOdooFormat(new Date());
                const client_message_id = `model_records_${model_info_extra.model}`;
                let offset = 0;
                let domain_forced = [];
                if (model_info_extra.prefetch_last_update) {
                    domain_forced = [
                        ["write_date", ">=", model_info_extra.prefetch_last_update],
                    ];
                }
                const domain = _.union(domain_forced, model_info_extra.domain);
                // Using 'false' to get all fields
                let fields = false;
                if (model_info_extra.excluded_fields.length) {
                    fields = Object.keys(_.omit(model_info_extra.fields, model_info_extra.excluded_fields));
                }
                /* Handle critical data */
                // Remove "password" info from res.users model
                if (model_info_extra.model === "res.users") {
                    if (fields === false) {
                        fields = Object.keys(_.omit(model_info_extra.fields, "password"));
                    } else {
                        fields = _.omit(fields, "password");
                    }
                }
                // Get ids
                const [
                    response_s
                ] = await this._rpc.callJSonRpc(model_info_extra.model, "search", [
                    domain,
                ]);
                const record_ids = (await response_s.json()).result;
                do {
                    this._sendTaskInfo(
                        client_message_id,
                        `Getting records of the model '${model_info_extra.name}'...`,
                        model_info_extra.count,
                        offset);
                    try {
                        // Get current records
                        const [response, request_data] = await this._rpc.pwaJSonRpc(
                            "browse_read",
                            {
                                ids: record_ids.slice(offset, offset+this._search_read_chunk_size),
                                model: model_info_extra.model,
                                fields: fields,
                            }
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
                            await this.search_read(
                                model,
                                response_data.result,
                                request_data.params.domain,
                            );
                        }
                        offset += response_data.result.length;
                    } catch (err) {
                        this._sendTaskInfoError(client_message_id, `Can't get records of the model ${model_info_extra.name}`);
                        return reject(err);
                    }
                } while (1);

                this._sendTaskInfoCompleted(client_message_id);

                this._dbmanager.sqlitedb.updateModelInfo([model_info_extra.id], {
                    prefetch_last_update: start_prefetch_date,
                });

                return resolve(offset);
            });
        },

        /**
         * @returns {Promise}
         */
        prefetchModelData: function () {
            return new Promise(async (resolve, reject) => {
                // Get lastest updates
                let model_infos = await this._dbmanager.sqlitedb.getModelInfo();
                const prefetch_last_updates = {};
                for (const model_info of model_infos) {
                    if (model_info.prefetch_last_update) {
                        prefetch_last_updates[model_info.model] = model_info.prefetch_last_update;
                    }
                }

                try {
                    const [response] = await this._rpc.sendJSonRpc(
                        "/pwa/prefetch/model",
                        {
                            last_update: prefetch_last_updates,
                        }
                    );
                    let response_data = await response.json();
                    const to_search_infos = response_data.result;
                    const model_names = _.map(to_search_infos, 'model');
                    model_infos = await this._dbmanager.sqlitedb.getModelInfo(model_names);
                    await this.createTables(model_infos);
                    for (const to_search of to_search_infos) {
                        const model_info = _.findWhere(model_infos, {model: to_search.model});
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
        prefetchModelInfoData: function () {
            return new Promise(async (resolve, reject) => {
                let model_infos = [];
                try {
                    const start_prefetch_date = tools.DateToOdooFormat(new Date());
                    const prefetch_last_update = await this.getParent().config.get(
                        "prefetch_modelinfo_last_update"
                    );
                    this._sendTaskInfo("model_info_data", `Getting all model's informations...`, -1, 0);
                    const [response] = await this._rpc.sendJSonRpc(
                        "/pwa/prefetch/model_info",
                        {
                            last_update: prefetch_last_update || false,
                        }
                    );
                    console.log("--------------- MODEL INFO DATA", prefetch_last_update);
                    let response_data = await response.json();
                    model_infos = response_data.result || [];
                    const tasks = [];
                    for (const model_info of model_infos) {
                        tasks.push(this.saveModelInfo(model_info));
                    }
                    await Promise.all(tasks);
                    await this.getParent().config.set(
                        "prefetch_modelinfo_last_update",
                        start_prefetch_date
                    );
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
        prefetchModelDefaultData: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    const start_prefetch_date = tools.DateToOdooFormat(new Date());
                    const prefetch_last_update = await this.getParent().config.get(
                        "prefetch_defaults_last_update"
                    );
                    this._sendTaskInfo("model_default_data", `Getting model default values formulas...`, -1, 0);
                    const [
                        response,
                    ] = await this._rpc.sendJSonRpc(
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
                    await this.getParent().config.set(
                        "prefetch_defaults_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError("model_default_data", "Can't get default values formulas of models");
                    return reject(err);
                }
                this._sendTaskInfoCompleted("model_default_data");
                return resolve();
            });
        },

        /**
         * @returns {Promise}
         */
        prefetchViewData: function (model_infos) {
            return new Promise(async (resolve, reject) => {
                try {
                    for (const index in model_infos) {
                        const model_info = model_infos[index];
                        this._sendTaskInfo(
                            "prefetch_view_data",
                            `Getting view's information for the model '${model_info.model}'...`,
                            model_infos.length,
                            index);

                        for (const view_type in model_info.view_types) {
                            const ids = model_info.view_types[view_type];
                            for (const id of ids) {
                                try {
                                    const [
                                        response
                                    ] = await this._rpc.callJSonRpc(model_info.model, "fields_view_get", [
                                        id,
                                        view_type,
                                        view_type !== 'search',
                                    ]);
                                    const fields_view = (await response.json()).result;
                                    if (!fields_view) {
                                        continue;
                                    }
                                    this.saveViews(fields_view);
                                } catch (err) {
                                    console.log(`[ServiceWorker] Can't get view info for ${model_info.model} -> ${id}`);
                                    console.log(err);
                                }
                            }
                        }
                    }
                    this._sendTaskInfoCompleted("prefetch_view_data");
                } catch (err) {
                    this._sendTaskInfoError("prefetch_view_data", "Can't get views infos");
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
        prefetchActionData: function () {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this.getParent().config.get(
                    "prefetch_action_last_update"
                );
                try {
                    // Get prefetching metadata
                    let [response] = await this._rpc.sendJSonRpc(
                        "/pwa/prefetch/action",
                        {
                            last_update: prefetch_last_update || false,
                        }
                    );
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
                                index);
                            const [response_s] = await this._rpc.sendJSonRpc(
                                "/web/action/load",
                                {
                                    action_id: action_id,
                                }
                            );
                            const response_s_data = (await response_s.json()).result;
                            await this.action_load(response_s_data);
                        }
                    }

                    await this.getParent().config.set(
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
        prefetchPostData: function () {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this.getParent().config.get(
                    "prefetch_post_last_update"
                );
                try {
                    // Get prefetching metadata
                    const [response] = await this._rpc.sendJSonRpc("/pwa/prefetch/post", {
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
                                index);
                            const num_params = post_def.params.length;
                            for (let i = 0; i < num_params; ++i) {
                                const [response_s, request_data_s] = await this._rpc.sendJSonRpc(
                                    post_def.url,
                                    post_def.params[i] || {}
                                );
                                const response_s_data = await response_s.json();
                                await this._generic_post(
                                    new URL(response_s.url).pathname,
                                    request_data_s.params,
                                    response_s_data.result
                                );
                            }
                        }
                    }

                    await this.getParent().config.set(
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
         * Prefetch onchange values
         *
         * @private
         * @param {String} type
         * @returns {Promise}
         */
        prefetchOnchangeData: function () {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this.getParent().config.get(
                    "prefetch_onchange_last_update"
                );
                try {
                    // Get onchange info
                    const [response] = await this._rpc.sendJSonRpc('/pwa/prefetch/onchange');
                    const response_data = (await response.json()).result;
                    const onchange_info_count = _.reduce(_.map(response_data, 'count'), (item, prev) => { return prev+item; });
                    // FIXME: Currently we can't know how invalidate previous data
                    // so remove all.
                    const model_info_onchange = await this._dbmanager.sqlitedb.getModelInfo("onchange", true);
                    await this._dbmanager.unlink(model_info_onchange);
                    // Request new onchange data
                    let count_done = 0;
                    let key_id_value = 0;
                    for (const onchange_info of response_data) {
                        this._sendTaskInfo(
                            "onchange_data",
                            `Calculating & Getting '${onchange_info.name}' 'onchange' data (${onchange_info.count} changes)...`,
                            onchange_info_count,
                            count_done);
                        const [response_s] = await this._rpc.sendJSonRpc('/pwa/prefetch/onchange', {
                            cache_id: onchange_info.id,
                        });
                        // Prefetch Onchange
                        const response_s_data = (await response_s.json()).result;
                        if (response_s_data) {
                            const tasks = [];
                            for (const onchange of response_s_data) {
                                onchange.field_value = onchange.field_value;
                                onchange.id = ++key_id_value;
                                tasks.push(this.saveOnchange(onchange));
                            }
                            await Promise.all(tasks);
                        }

                        count_done += onchange_info.count;
                    }

                    await this.getParent().config.set(
                        "prefetch_onchange_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError("onchange_data", "Can't get onchange infos");
                    return reject(err);
                }

                this._sendTaskInfoCompleted("onchange_data");
                return resolve();
            });
        },

        /**
         * Prefetch function calls values
         *
         * @private
         * @returns {Promise}
         */
        prefetchFunctionData: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    this._sendTaskInfo("function_data", `Calculating & Getting 'call function' data...`, -1, 0);
                    // Get prefetching metadata
                    let [response] = await this._rpc.sendJSonRpc("/pwa/prefetch/function");
                    const response_data = (await response.json()).result;
                    if (response_data) {
                        const tasks = [];
                        for (const func of response_data) {
                            tasks.push(this.saveFunctionData({
                                model: func.model,
                                method: func.method,
                                params: func.params,
                                return: func.result,
                            }));
                        }
                        await Promise.all(tasks);
                    }
                } catch (err) {
                    this._sendTaskInfoError("onchange_data", "Can't get function results");
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
        prefetchClientQWebData: function () {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this.getParent().config.get(
                    "prefetch_clientqweb_last_update"
                );
                try {
                    // Get prefetching metadata
                    const [response] = await this._rpc.sendJSonRpc("/pwa/prefetch/clientqweb", {
                        last_update: prefetch_last_update || false,
                    });
                    // Prefetch Templates
                    const response_data = (await response.json()).result;
                    if (response_data) {
                        const num_views = response_data.length + 1;
                        for (const index in response_data) {
                            const xml_ref = response_data[index];
                            this._sendTaskInfo("clientqweb_data", `Getting client template '${xml_ref}'...`, num_views, index);
                            const [
                                response_s,
                                request_s_data,
                            ] = await this._rpc.callJSonRpc("ir.ui.view", "read_template", [
                                xml_ref,
                                {lang: this.getParent().config.getLang()},
                            ]);
                            const response_s_data = (await response_s.json()).result;
                            await this.read_template(false, response_s_data, {args: [xml_ref]});
                        }
                    }
                    await this.getParent().config.set(
                        "prefetch_clientqweb_last_update",
                        start_prefetch_date
                    );
                } catch (err) {
                    this._sendTaskInfoError("clientqweb_data", "Can't get client qweb templates");
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
        prefetchUserData: function () {
            return new Promise(async (resolve, reject) => {
                const start_prefetch_date = tools.DateToOdooFormat(new Date());
                const prefetch_last_update = await this.getParent().config.get(
                    "prefetch_userdata_last_update"
                );
                try {
                    this._sendTaskInfo("user_data_translation", "Getting translations...", -1, 0);
                    let [response] = await this._rpc.sendJSonRpc(
                        "/pwa/prefetch/userdata",
                        {
                            last_update: prefetch_last_update || false,
                        }
                    );
                    let response_data = (await response.json()).result;
                    if (response_data) {
                        const [response_s] = await this._rpc.sendJSonRpc(
                            "/web/webclient/translations",
                            {
                                mods: response_data.list_modules || null,
                                lang: response_data.lang || null,
                            }
                        );
                        const response_s_data = (await response_s.json()).result;
                        await this.translations(response_s_data);
                    }
                    this._sendTaskInfoCompleted("user_data_translation");
                    this._sendTaskInfo("user_data_menu", "Getting menus...", -1, 0);
                    [response] = await this._rpc.callJSonRpc(
                        "ir.ui.menu",
                        "load_menus",
                        ["assets"]
                    );
                    response_data = (await response.json()).result;
                    await this.load_menus(false, response_data);
                    await this.getParent().config.set(
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
         * @param {Object} values
         * @returns {Promise}
         */
        saveModelInfo: function (values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_metadata = await this._dbmanager.sqlitedb.getModelInfo("model_metadata", true);
                    await this._dbmanager.sqlitedb.createOrUpdateRecord(model_info_metadata, _.omit(values, ["count", "domain", "excluded_fields"]), ["model"]);
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
        saveModelDefaults: function (values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_defaults = await this._dbmanager.sqlitedb.getModelInfo("defaults", true);
                    await this._dbmanager.sqlitedb.createOrUpdateRecord(model_info_defaults, values, false);
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
        saveViews: function (values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_views = await this._dbmanager.sqlitedb.getModelInfo("views", true);
                    await this._dbmanager.sqlitedb.createOrUpdateRecord(model_info_views, values, ["model", "view_id", "type"]);
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
        saveOnchange: function (values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_onchange = await this._dbmanager.sqlitedb.getModelInfo("onchange", true);
                    await this._dbmanager.sqlitedb.createOrUpdateRecord(model_info_onchange, values, ["id"]);
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
        saveFunctionData: function (values) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_function = await this._dbmanager.sqlitedb.getModelInfo("function", true);
                    await this._dbmanager.sqlitedb.createOrUpdateRecord(model_info_function, values, ["model", "method", "params"]);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },
    });

    return ComponentPrefetch;

});
