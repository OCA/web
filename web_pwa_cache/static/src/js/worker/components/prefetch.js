"use strict";
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

 const ComponentPrefetch = ComponentImporter.extend({

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
    _sendTaskInfo: function (id, progress, message, error = false) {
        this.getParent().postClientPageMessage({
            type: "PREFETCH_MODAL_TASK_INFO",
            id: id,
            message: message,
            progress: progress,
            error: error,
        });
    },

    /**
     * Wrapper to send completed task info
     *
     * @param {String} id
     */
    _sendTaskInfoCompleted: function (id) {
        this._sendTaskInfo(id, 1, "Completed!");
    },


    /**
     * Wrapper to send completed task info
     *
     * @param {String} id
     */
    _sendTaskInfoError: function (id, message) {
        this._sendTaskInfo(id, -1, `Error: ${message}`, true);
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
     * Helper function
     *
     * @param {Object} model_info
     * @returns {Promise}
     */
    _getModelFields: function (model_info) {
        return new Promise(async (resolve, reject) => {
            let fields = {};
            try {
                const [response] = await this._rpc.callJSonRpc(
                    model_info.model,
                    "fields_get"
                );
                const response_data = await response.json();
                fields = response_data.result;
            } catch (err) {
                return reject(err);
            }
            return resolve(fields);
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
            try {
                const model_infos = await this.prefetchModelInfoData();
                await Promise.all([
                    this.prefetchModelData(),
                    this.prefetchModelDefaultData(model_infos),
                    this.prefetchFilterData(),
                    this.prefetchViewData(),
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
            return resolve();
        });
    },

    /**
     * @returns {Promise}
     */
    runVacuumRecords: function () {
        return new Promise(async (resolve) => {
            try {
                const models = await this._odoodb.getModelInfo();
                const num_models = models.length;

                for (const index in models) {
                    this._sendTaskInfo(
                        "vacuum_records",
                        index / num_models,
                        `Vacuum records of the model '${model_info.model_name}'...`);
                    const [
                        response_s,
                        request_data_s,
                    ] = await this._rpc.callJSonRpc(model_info.model, "search", [
                        model_info.domain,
                    ]);
                    response_data = await response_s.json();
                    await this._odoodb.vacuumRecords(
                        model_info.model,
                        response_data.result
                    );
                }
            } catch (err) {
                // do nothing
            }
            this._sendTaskInfoCompleted("vacuum_records");
            return resolve();
        });
    },

    /**
     * @param {Object} model_info_extra
     * @returns {Promise}
     */
    prefetchModelRecords: function (model_info_extra, proc_records) {
        const CHUNK_SIZE = 500;
        return new Promise(async (resolve, reject) => {
            const start_prefetch_date = DateToOdooFormat(new Date());
            const client_message_id = `model_records_${model_info_extra.model.replaceAll(".", "_")}`;
            let offset = 0;
            let domain_forced = [];
            if (model_info_extra.prefetch_last_update) {
                domain_forced = [
                    ["write_date", ">=", model_info_extra.prefetch_last_update],
                ];
            }
            const domain = _.union(domain_forced, model_info_extra.domain);
            let fields = Object.keys(_.omit(model_info_extra.fields, model_info_extra.excluded_fields));
            fields = _.isEmpty(fields)?false:fields;
            do {
                this._sendTaskInfo(
                    client_message_id,
                    offset / model_info_extra.count,
                    `Getting records of the model '${model_info_extra.model_name}'...`);
                try {
                    // Get current records
                    const [response, request_data] = await this._rpc.datasetJSonRpc(
                        "search_read",
                        {
                            domain: domain,
                            model: model_info_extra.model,
                            fields: fields,
                            offset: offset,
                            limit: CHUNK_SIZE,
                        }
                    );
                    const response_data = await response.json();
                    if (response_data.result.records.length === 0) {
                        break;
                    }
                    if (proc_records) {
                        proc_records.push(...response_data.result.records);
                    }
                    const model = request_data.params.model;
                    await this.search_read(
                        model,
                        response_data.result,
                        JSON.stringify(request_data.params.domain)
                    );
                    offset += response_data.result.records.length;
                } catch (err) {
                    this._sendTaskInfoError(client_message_id, `Can't get records of the model ${model_info_extra.model_name}`);
                    return reject(err);
                }
            } while (1);

            this._sendTaskInfoCompleted(client_message_id);

            this._odoodb.updateModelInfo(model_info_extra.model, {
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
            const model_infos = await this._odoodb.getModelInfo();
            const prefetch_last_updates = {};
            for (const model_info of model_infos) {
                prefetch_last_updates[model_info.model] = model_info.prefetch_last_update;
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
                for (const to_search of to_search_infos) {
                    const model_info = await this._odoodb.getModelInfo(to_search.model);
                    const model_info_extra = _.extend({}, model_info, to_search);
                    await this.prefetchModelRecords(model_info_extra);
                }

                // Prefetch Model Data
                let model_info = await this._odoodb.getModelInfo("ir.model.data");
                model_info.count = await this._getModelCount(model_info);
                await this.saveModelInfo(model_info);
                await this.prefetchModelRecords(model_info);
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
            const start_prefetch_date = DateToOdooFormat(new Date());
            const prefetch_last_update = await this.getParent().config.get(
                "prefetch_modelinfo_last_update"
            );
            let model_infos = [];
            try {
                this._sendTaskInfo("model_info_data", -1, `Getting all model's informations...`);
                const [response] = await this._rpc.sendJSonRpc(
                    "/pwa/prefetch/model_info",
                    {
                        last_update: prefetch_last_update,
                    }
                );
                let response_data = await response.json();
                model_infos = response_data.result;
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
    prefetchModelDefaultData: function (model_infos) {
        return new Promise(async (resolve, reject) => {
            const num_infos = model_infos.length;
            try {
                for (const index in model_infos) {
                    const model_info = model_infos[index];
                    this._sendTaskInfo(
                        "model_default_data",
                        index / num_infos,
                        `Getting default values of the model '${model_info.model_name}'...`);
                    const [
                        response,
                    ] = await this._rpc.sendJSonRpc(
                        "/pwa/prefetch/model_default",
                        {
                            last_update: model_info.prefetch_last_update,
                            model: model_info.model,
                        }
                    );
                    const response_model_default_data = (await response.json()).result;
                    if (response_model_default_data) {
                        await this._odoodb.updateModelInfo(model_info.model, {
                            defaults: response_model_default_data.defaults,
                        });
                    }
                }
            } catch (err) {
                this._sendTaskInfoError("model_default_data", "Can't get default values of models");
                return reject(err);
            }
            this._sendTaskInfoCompleted("model_default_data");
            return resolve();
        });
    },

    /**
     * @returns {Promise}
     */
    prefetchFilterData: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let model_info = await this._odoodb.getModelInfo("ir.filters");
                model_info.count = await this._getModelCount(model_info);
                await this.saveModelInfo(model_info);
                await this.prefetchModelRecords(model_info);
            } catch (err) {
                return reject(err);
            }
            return resolve();
        });
    },

    /**
     * @returns {Promise}
     */
    prefetchViewData: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let model_info = await this._odoodb.getModelInfo("ir.ui.view");
                model_info.count = await this._getModelCount(model_info);
                await this.saveModelInfo(model_info);
                const proc_records = [];
                const prefetch_count = await this.prefetchModelRecords(model_info, proc_records);
                const cmodels = [];
                for (const index in proc_records) {
                    const record = proc_records[index];
                    if (!record.model) {
                        continue;
                    }
                    this._sendTaskInfo(
                        "prefetch_view_data",
                        index / prefetch_count,
                        `Getting '${record.name}' view information for the model '${record.model}'...`);
                    if (cmodels.indexOf(record.model) === -1) {
                        cmodels.push(record.model);
                    }
                    const [
                        response,
                        request_data,
                    ] = await this._rpc.callJSonRpc(record.model, "fields_view_get", [
                        record.id,
                        record.type,
                        record.type !== 'search',
                    ]);
                    const fields_view = (await response.json()).result;
                    await this._db.createOrUpdateRecord(
                        "webclient",
                        "views",
                        false,
                        [fields_view.model, fields_view.view_id, fields_view.type],
                        fields_view);
                }
                this._sendTaskInfoCompleted("prefetch_view_data");

                // Adds generic views
                const field_infos = await this._odoodb.getModelFieldsInfo("ir.ui.view", ["type"]);
                const types = _.map(field_infos.type.selection, (item) => item[0]);
                const extra_views_count = types.length * cmodels.length;
                let iter_count = 0;
                for (const model of cmodels) {
                    for (const type of types) {
                        this._sendTaskInfo(
                            "prefetch_view_extra_data",
                            iter_count / extra_views_count,
                            `Getting generic '${type}' view information for the model '${model}'...`);
                        const [
                            response,
                            request_data,
                        ] = await this._rpc.callJSonRpc(model, "fields_view_get", [
                            false,
                            type,
                            true,
                        ]);
                        const fields_view = (await response.json()).result;
                        if (!fields_view) {
                            continue;
                        }
                        fields_view.view_id = 0;
                        await this._db.createOrUpdateRecord(
                            "webclient",
                            "views",
                            false,
                            [model, 0, fields_view.type],
                            fields_view);
                        ++iter_count;
                    }
                }
            } catch (err) {
                this._sendTaskInfoError("prefetch_view_extra_data", "Can't get views infos");
                return reject(err);
            }
            this._sendTaskInfoCompleted("prefetch_view_extra_data");
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
            const start_prefetch_date = DateToOdooFormat(new Date());
            const prefetch_last_update = await this.getParent().config.get(
                "prefetch_action_last_update"
            );
            try {
                // Get prefetching metadata
                let [response] = await this._rpc.sendJSonRpc(
                    "/pwa/prefetch/action",
                    {
                        last_update: prefetch_last_update,
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
                            index / num_actions,
                            `Getting info of the action #${action_id}...`);
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
            const start_prefetch_date = DateToOdooFormat(new Date());
            const prefetch_last_update = await this.getParent().config.get(
                "prefetch_post_last_update"
            );
            try {
                // Get prefetching metadata
                const [response] = await this._rpc.sendJSonRpc("/pwa/prefetch/post", {
                    last_update: prefetch_last_update,
                });
                // Prefetch Posts
                const response_data = (await response.json()).result;
                if (response_data) {
                    const num_posts = response_data.length + 1;
                    for (const index in response_data) {
                        const post_def = response_data[index];
                        this._sendTaskInfo(
                            "post_data",
                            index / num_posts,
                            `Getting post results of the endpoint '${post_def.url}'...`);
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
            const start_prefetch_date = DateToOdooFormat(new Date());
            const prefetch_last_update = await this.getParent().config.get(
                "prefetch_onchange_last_update"
            );
            try {
                // Get onchange info
                const [response] = await this._rpc.sendJSonRpc('/pwa/prefetch/onchange');
                const response_data = (await response.json()).result;
                const onchange_info_count = _.reduce(_.map(response_data, 'count'), (item, prev) => { return prev+item; });
                // Remove all current onchange data
                await this._db.deleteAllRecords("webclient", "onchange");
                // Request new onchange data
                let count_done = 0;
                let key_id_value = 0;
                for (const onchange_info of response_data) {
                    this._sendTaskInfo(
                        "onchange_data",
                        count_done / onchange_info_count,
                        `Calculating & Getting '${onchange_info.name}' 'onchange' data (${onchange_info.count} changes)...`);
                    const [response_s] = await this._rpc.sendJSonRpc('/pwa/prefetch/onchange', {
                        cache_id: onchange_info.id,
                    });
                    // Prefetch Onchange
                    const response_s_data = (await response_s.json()).result;
                    if (response_s_data) {
                        const tasks = [];
                        for (const onchange of response_s_data) {
                            onchange.field_value = JSON.stringify(onchange.field_value);
                            onchange.id = ++key_id_value;
                            tasks.push(this._db.createOrUpdateRecord(
                                "webclient",
                                "onchange",
                                false,
                                onchange.id,
                                onchange
                            ));
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
                this._sendTaskInfo("function_data", -1, `Calculating & Getting 'call function' data...`);
                // Get prefetching metadata
                let [response] = await this._rpc.sendJSonRpc("/pwa/prefetch/function");
                const response_data = (await response.json()).result;
                if (response_data) {
                    const tasks = [];
                    for (const func of response_data) {
                        const sparams = JSON.stringify(func.params);
                        tasks.push(this._db.createOrUpdateRecord("webclient", "function", false, [func.model, func.method, sparams], {
                            model: func.model,
                            method: func.method,
                            params: sparams,
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
            const start_prefetch_date = DateToOdooFormat(new Date());
            const prefetch_last_update = await this.getParent().config.get(
                "prefetch_clientqweb_last_update"
            );
            try {
                // Get prefetching metadata
                const [response] = await this._rpc.sendJSonRpc("/pwa/prefetch/clientqweb", {
                    last_update: prefetch_last_update,
                });
                // Prefetch Templates
                const response_data = (await response.json()).result;
                if (response_data) {
                    const num_views = response_data.length + 1;
                    for (const index in response_data) {
                        const xml_ref = response_data[index];
                        this._sendTaskInfo("clientqweb_data", index / num_views, `Getting client template '${xml_ref}'...`);
                        const [
                            response_s,
                            request_s_data,
                        ] = await this._rpc.callJSonRpc("ir.ui.view", "read_template", [
                            xml_ref,
                            {lang: await this.getParent().config.getLang()},
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
            const start_prefetch_date = DateToOdooFormat(new Date());
            const prefetch_last_update = await this.getParent().config.get(
                "prefetch_userdata_last_update"
            );
            try {
                this._sendTaskInfo("user_data_translation", -1, "Getting translations...");
                let [response] = await this._rpc.sendJSonRpc(
                    "/pwa/prefetch/userdata",
                    {
                        last_update: prefetch_last_update,
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
                this._sendTaskInfo("user_data_menu", -1, "Getting menus...");
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
});
