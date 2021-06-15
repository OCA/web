/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Exporter", function(require) {
    "use strict";

    const SWComponent = require("web_pwa_cache.PWA.components.Component");
    const JSSandbox = require("web_pwa_cache.PWA.core.base.JSSandbox");
    const Tools = require("web_pwa_cache.PWA.core.base.Tools");
    const Expression = require("web_pwa_cache.PWA.core.osv.Expression");

    /**
     * This class is used to get the necessary data to simulate the Odoo replies.
     * The name of the functions match with the name of the python implementation.
     */
    const SWExporterComponent = SWComponent.extend({
        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        name_search: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const operator = data.kwargs.operator || "ilike";
                    const search =
                        "name" in data.kwargs ? data.kwargs.name : data.args[0];
                    let domain =
                        "args" in data.kwargs ? data.kwargs.args : data.args[1];
                    const limit =
                        "args" in data.kwargs ? data.kwargs.limit : data.args[2];
                    const model_info = this._db.getModelInfo(model);
                    if (search) {
                        const name_search =
                            model_info.rec_name === "name"
                                ? "display_name"
                                : model_info.rec_name;
                        domain = _.union([[name_search, operator, search]], domain);
                    }
                    let records = await this._db.search_read(model, domain, limit, [
                        "id",
                        "display_name",
                    ]);
                    records = records.map(item => _.values(item));
                    return resolve(records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        name_get: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    let record_ids = data.args;
                    if (!record_ids || _.isEmpty(record_ids)) {
                        return resolve([]);
                    }
                    if (typeof record_ids[0] !== "number") {
                        record_ids = record_ids[0];
                    }
                    const records = await this._db.browse(model, record_ids, [
                        "id",
                        "display_name",
                    ]);
                    if (!records.length && !this.isOfflineMode()) {
                        // Only reject if not offline
                        return reject();
                    }
                    const filtered_records = records.map(item => _.values(item));
                    return resolve(filtered_records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        onchange: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const record_data = data.args[1];
                    let fields_changed = data.args[2];
                    const result = {value: {}};

                    if (typeof fields_changed === "string") {
                        fields_changed = [fields_changed];
                    }

                    // Generate Onchange Values Virtual Table
                    const sandbox = new JSSandbox();
                    const record_data_folded = Tools.foldObj(record_data);
                    const model_info_pwa_cache = this._db.getModelInfo("pwa.cache");
                    const model_info_pwa_onchange = this._db.getModelInfo(
                        "pwa.cache.onchange"
                    );
                    const model_info_pwa_onchange_value = this._db.getModelInfo(
                        "pwa.cache.onchange.value"
                    );
                    let catch_from_server = true;

                    for (const field of fields_changed) {
                        // TODO: Determine onchange execution order through onchange_spec
                        const sql_pwa_cache = `SELECT id,cache_type,code_js FROM ${model_info_pwa_cache.table} WHERE "onchange_field_name"="${field}" AND "model_name"="${model}" AND "cache_type" IN ("onchange", "onchange_formula")`;
                        const record = await this._db.sqlitedb
                            .getDB()
                            .get([sql_pwa_cache]);
                        if (!_.isEmpty(record)) {
                            this._db.sqlitedb.converter.toOdoo(
                                model_info_pwa_cache.fields,
                                record
                            );
                            catch_from_server = false;
                            let value = false;
                            let warning = false;
                            let domain = false;
                            if (record.cache_type === "onchange_formula") {
                                sandbox.compile(record.code_js);
                                const changes = sandbox.run(record_data);
                                value = changes.value;
                                warning = changes.warning;
                                domain = changes.domain;
                            } else {
                                const sql_selectors = `SELECT field_name FROM ${model_info_pwa_onchange.table} WHERE "pwa_cache_id"=${record.id} AND NOT disposable`;
                                const selectors = await this._db.sqlitedb
                                    .getDB()
                                    .all([sql_selectors]);
                                // TODO: Ver el orden
                                let vals = {};
                                for (const selector of selectors) {
                                    vals[selector.field_name] =
                                        record_data_folded[selector.field_name];
                                }
                                vals = Tools.unfoldObj(vals);
                                let str_vals = Expression.convert_to_column(model_info_pwa_onchange_value.fields.values, vals);
                                const sql_value = `SELECT result FROM ${model_info_pwa_onchange_value.table} WHERE "pwa_cache_id"=${record.id} AND "field_name"="${field}" AND "values"=${str_vals}`;
                                const value_record = await this._db.sqlitedb
                                    .getDB()
                                    .get([sql_value]);
                                if (!_.isEmpty(value_record)) {
                                    const onchange_data = JSON.parse(value_record.result);
                                    value = onchange_data.value;
                                    warning = onchange_data.warning;
                                    domain = onchange_data.domain;
                                }
                            }
                            if (value) {
                                result.value = _.extend({}, result.value, value);
                            }
                            if (warning) {
                                result.warning = _.extend({}, result.warning, warning);
                            }
                            if (domain) {
                                result.domain = _.extend({}, result.domain, domain);
                            }
                        }
                    }
                    if (catch_from_server && !this.isOfflineMode()) {
                        console.log(
                            `[ServiceWorker] Can't process the given onchange for the fields '${fields_changed.join(
                                ","
                            )}' on the model '${model}'`
                        );
                        return reject();
                    }

                    return resolve(result);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        read: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const records = await this._db.browse(data.model, data.args[0]);
                    if (records.length === 0) {
                        if (this.isOfflineMode()) {
                            return resolve({});
                        }
                        return reject();
                    }
                    const pick_keys = _.union(["id"], data.args[1]);
                    const mapped_records = _.map(records, item =>
                        _.pick(item, pick_keys)
                    );
                    // Need binary fields?
                    const binary_field_infos = await this._db.getModelFieldsInfo(
                        data.model,
                        pick_keys,
                        "binary"
                    );
                    const binary_field_names = Object.keys(binary_field_infos);
                    if (
                        binary_field_names.length &&
                        _.difference(pick_keys, binary_field_names).length
                    ) {
                        for (const id of data.args[0]) {
                            const binary_record = await this._db.browseBinary(
                                data.model,
                                id
                            );
                            if (binary_record) {
                                _.chain(mapped_records)
                                    .findWhere({id: id})
                                    .extend(_.pick(binary_record, binary_field_names));
                            }
                        }
                    }
                    return resolve(mapped_records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        read_group: function(model, data) {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    // In offline mode return an empty read_group to avoid issues
                    // FIXME: We can't implement all modifications of this method :/
                    const fields = data.kwargs.fields;
                    const res = [];
                    for (const field of fields) {
                        const values = {
                            id: null,
                            __count: 0,
                            [field]: null,
                        };
                        res.push(values);
                    }
                    return resolve(res);
                }
                return reject();
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        copy: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (this.isOfflineMode()) {
                        const record_id = data.args[0];
                        const records = await this._db.browse(model, record_id);
                        records[0].id = this._db.genRecordID();
                        const model_info = this._db.getModelInfo(model);
                        const values = {
                            args: records,
                        };
                        console.log("---- COPY");
                        console.log(values);
                        console.log(model_info);
                        const c_ids = await this._process_record_create(
                            model_info,
                            values
                        );
                        console.log("---- COPY AAA");
                        console.log(c_ids);
                        this._sync.sendCountToPages();
                        return resolve(c_ids[0]);
                    }
                } catch (err) {
                    return reject(err);
                }

                return reject();
            });
        },

        /**
         * @param {Strins} model
         * @param {Object} data
         * @returns {Promise}
         */
        read_template: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_template = this._db.getModelInfo("template", true);
                    const record = await this.search_read(
                        model_info_template,
                        [["xml_ref", "=", data.args[0]]],
                        1
                    );
                    if (_.isEmpty(record)) {
                        if (this.isOfflineMode()) {
                            return resolve({});
                        }
                        return reject();
                    }
                    return resolve(record.template);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        write: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info = this._db.getModelInfo(model);
                    await this._process_record_write(model_info, data);
                    this._sync.sendCountToPages();
                    return resolve(true);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        create: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info = this._db.getModelInfo(model);

                    // Get context defaults
                    const context_defaults = data.kwargs.context;
                    const default_keys = _.filter(
                        Object.keys(context_defaults),
                        function(item) {
                            return item.startsWith("default_");
                        }
                    );
                    const defaults = {};
                    for (const key of default_keys) {
                        // 8 > Omit 'default_'
                        const skey = key.substr(8);
                        const svalue = context_defaults[key];
                        if (typeof svalue === "object") {
                            defaults[skey] = context_defaults[key];
                        } else if ("relation" in model_info.fields[skey]) {
                            defaults[skey] = (
                                await this.name_get(model_info.fields[skey].relation, {
                                    args: [[context_defaults[key]]],
                                })
                            )[0];
                        } else {
                            defaults[skey] = context_defaults[key];
                        }
                    }

                    data.args = _.map(data.args, item =>
                        _.extend({id: this._db.genRecordID()}, item, defaults)
                    );
                    const c_ids = await this._process_record_create(model_info, data);
                    this._sync.sendCountToPages();
                    return resolve(c_ids.length === 1 ? c_ids[0] : c_ids);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         *
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        unlink: function(model, data) {
            return new Promise(async resolve => {
                await this._db.unlink(model, data.args[0]);
                const model_info_sync = this._db.getModelInfo("sync", true);
                await this._db.create(model_info_sync, {
                    model: model,
                    method: "unlink",
                    args: [[data.args[0]]],
                    date: new Date().getTime(),
                });
                this._sync.sendCountToPages();
                return resolve(true);
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        default_get: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_defaults = await this._db.getModelDefaults(model);
                    if (_.isEmpty(model_defaults) && !this.isOfflineMode()) {
                        return reject();
                    }
                    const context_defaults = data.kwargs.context;
                    const default_keys = Object.keys(context_defaults).filter(item =>
                        item.startsWith("default_")
                    );
                    const defaults = {};
                    for (const key of default_keys) {
                        const skey = key.substr(8);
                        defaults[skey] = context_defaults[key];
                    }
                    return resolve(
                        _.chain({})
                            .extend(model_defaults, defaults)
                            .pick(data.args[0])
                            .value()
                    );
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        get_filters: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const uid = this._config.getUID();
                    const model = data.args[0];
                    const action_id = data.args[1];
                    const filters = await this._db.getModelFilters(
                        model,
                        uid,
                        action_id
                    );
                    if (!filters.length && !this.isOfflineMode()) {
                        return reject();
                    }
                    return resolve(filters);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        load_views: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const options = data.kwargs.options;
                    const views = data.kwargs.views;
                    const uid = this._config.getUID();
                    const res = await this._db.getFieldsViews(
                        model,
                        uid,
                        views,
                        options
                    );
                    if (_.isEmpty(res) && !this.isOfflineMode()) {
                        return reject();
                    }
                    return resolve(res);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @returns {Promise}
         */
        load_menus: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_userdata = this._db.getModelInfo("userdata", true);
                    const record = await this._db.search_read(
                        model_info_userdata,
                        [["param", "=", "menus"]],
                        1
                    );
                    if (_.isEmpty(record) && !this.isOfflineMode()) {
                        return reject();
                    }
                    return resolve(record.value);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Offline mode (all rights)
         *
         * @returns {Promise}
         */
        check_access_rights: function() {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    return resolve(true);
                }
                return reject();
            });
        },

        /**
         * Offline mode (all groups)
         *
         * @returns {Promise}
         */
        has_group: function() {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    return resolve(true);
                }
                return reject();
            });
        },

        /**
         * Offline mode (can't know this info)
         *
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        xmlid_to_res_id: function(model, data) {
            return new Promise(async (resolve, reject) => {
                const xmlid = data.kwargs.xmlid;
                try {
                    const record = await this._db.ref(xmlid);
                    if (_.isEmpty(record) && !this.isOfflineMode()) {
                        return reject();
                    }
                    return resolve(record.id);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object} data
         * @returns {Promise}
         */
        action_load: function(data) {
            return new Promise(async (resolve, reject) => {
                try {
                    let action_id = data.action_id;
                    if (typeof action_id !== "number") {
                        const action = await this._db.ref(action_id);
                        action_id = action.id;
                    }
                    const model_info_base_actions = this._db.getModelInfo(
                        "ir.actions.actions"
                    );
                    const base_action = await this._db.browse(
                        model_info_base_actions,
                        action_id
                    );
                    const model_info_actions = this._db.getModelInfo(base_action.type);
                    const record = await this._db.browse(model_info_actions, action_id);
                    if (_.isEmpty(record) && !this.isOfflineMode()) {
                        return reject();
                    }

                    // Parse values to be used by the client
                    // if ("domain" in record && record.domain) {
                    //     record.domain = JSON.parse(record.domain);
                    // }
                    // If ("context" in record && record.context) {
                    //     console.log("--- THE CONTEXT", record.context);
                    //     record.context = JSON.parse(record.context);
                    // }
                    // if ("search_view" in record && record.search_view) {
                    //     record.search_view = JSON.parse(record.search_view);
                    // }

                    return resolve(record);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        search_read: function(model, data) {
            return new Promise(async (resolve, reject) => {
                const pmodel = data.model;
                let pdomain = data.domain;
                let pfields = data.fields;
                let plimit = data.limit;
                let poffset = data.offset;
                let psort = data.sort;
                if ("kwargs" in data) {
                    pfields = data.kwargs.fields;
                    pdomain = data.kwargs.domain;
                    plimit = data.kwargs.limit;
                    poffset = data.kwargs.offset;
                    psort = data.kwargs.sort;
                }
                let records = false,
                    records_count = 0;
                try {
                    records = await this._db.search_read(
                        pmodel,
                        pdomain,
                        plimit,
                        _.union(["id"], pfields),
                        poffset,
                        psort
                    );

                    if (_.isEmpty(records) && !this.isOfflineMode()) {
                        return reject("No records");
                    }

                    if (plimit && records.length === plimit) {
                        records_count = await this._db.count(pmodel, pdomain);
                    } else {
                        records_count = records.length + (poffset || 0);
                    }
                } catch (err) {
                    // If not offline we need try from odoo server
                    if (!this.isOfflineMode()) {
                        return reject(err);
                    }
                }

                const model_info = this._db.getModelInfo(pmodel);
                records = this._db.sqlitedb.converter.removeNoFields(
                    model_info.fields,
                    records
                );

                if ("kwargs" in data) {
                    return resolve(records);
                }
                return resolve({
                    length: records_count,
                    records: records,
                });
            });
        },

        /**
         * In offline mode can't create new filters
         *
         * @returns {Promise}
         */
        create_or_replace: function() {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    return resolve(false);
                }
                return reject();
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        fields_get: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info = this._db.getModelInfo(model);
                    if (_.isEmpty(model_info) && !this.isOfflineMode()) {
                        return reject();
                    }
                    const fields_info = {};
                    for (const key in model_info.fields) {
                        const field_info = model_info.fields[key];
                        fields_info[key] = _.pick(field_info, data.args[1]);
                    }
                    return resolve(fields_info);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Use generic id all times
         *
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        // eslint-disable-next-line
        get_formview_id: function(model, data) {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    return resolve(false);
                }
                return reject();
            });
        },

        /**
         * Use generic id all times
         *
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        get_formview_action: function(model, data) {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    const record_id = data.args[0][0];
                    return resolve({
                        type: "ir.actions.act_window",
                        res_model: model,
                        view_type: "form",
                        view_mode: "form",
                        views: [[false, "form"]],
                        target: "current",
                        res_id: record_id,
                    });
                }
                return reject();
            });
        },

        /**
         * Wkhtml is not supported in offline mode
         *
         * @returns {Promise}
         */
        check_wkhtml_to_pdf: function() {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    return resolve("broken");
                }
                return reject();
            });
        },

        /**
         * In offline mode can't run action of type
         * ir.actions.server
         *
         * @returns {Promise}
         */
        action_run: function() {
            return new Promise(async (resolve, reject) => {
                if (this.isOfflineMode()) {
                    return resolve(false);
                }
                return reject();
            });
        },

        systray_get_activities: function() {
            if (this.isOfflineMode()) {
                return Promise.resolve([]);
            }
            return Promise.reject();
        },

        read_followers: function(res_model, follower_ids) {
            return new Promise(async (resolve, reject) => {
                try {
                    const followers = [];
                    // When editing the followers, the "pencil" icon that leads to the edition of subtypes
                    // should be always be displayed and not only when "debug" mode is activated.
                    const is_editable = true;
                    const partner_id = this._config.getPartnerID();
                    let follower_id = false;
                    const follower_recs = await this._db.browse(
                        "mail.followers",
                        follower_ids
                    );
                    if (_.isEmpty(follower_recs) && !this.isOfflineMode()) {
                        return reject("No mail.followers records");
                    }
                    // Const res_ids = _.map(follower_recs, 'res_id');
                    // request.env[res_model].browse(res_ids).check_access_rule("read")
                    for (const follower of follower_recs) {
                        const follower_partner_id = await this._db.browse(
                            "res.partner",
                            [follower.partner_id[0]]
                        );
                        const is_uid = partner_id === follower_partner_id.id;
                        follower_id = is_uid ? follower.id : follower_id;
                        followers.push({
                            id: follower.id,
                            name: follower.partner_id[1] || follower.channel_id[1],
                            email: follower_partner_id
                                ? follower_partner_id.email
                                : false,
                            res_model: follower_partner_id
                                ? "res.partner"
                                : "mail.channel",
                            res_id: follower_partner_id.id || follower.channel_id[0],
                            is_editable: is_editable,
                            is_uid: is_uid,
                            active:
                                follower_partner_id.active ||
                                Boolean(follower.channel_id[0]),
                        });
                    }
                    return resolve({
                        followers: followers,
                        subtypes: follower_id
                            ? await this._db.read_subscription_data(
                                  res_model,
                                  follower_id
                              )
                            : false,
                    });
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Generic handle for post caching response
         *
         * @private
         * @param {String} pathname
         * @param {Object} params
         * @returns {Promise}
         */
        _generic_post: function(pathname, params) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info = this._db.getModelInfo("post", true);
                    const record = await this._db.search_read(
                        model_info,
                        [
                            ["pathname", "=", pathname],
                            ["params", "=", params],
                        ],
                        1
                    );
                    if (_.isEmpty(record)) {
                        if (this.isOfflineMode()) {
                            return resolve(false);
                        }
                        return reject();
                    }
                    return resolve(record.result);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Generic handle for function calls caching response
         *
         * @private
         * @param {String} model
         * @param {String} method
         * @param {Object} params
         * @returns {Promise}
         */
        _generic_function: function(model, method, params) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info = this._db.getModelInfo("function", true);
                    const record = await this._db.search_read(
                        model_info,
                        [
                            ["model", "=", model],
                            ["method", "=", method],
                            ["params", "=", params],
                        ],
                        1
                    );
                    if (_.isEmpty(record)) {
                        if (this.isOfflineMode()) {
                            return resolve(false);
                        }
                        return reject();
                    }
                    return resolve(record.result);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * GET REQUESTS
         * /

        /**
         * @param {String} model
         * @param {Number/String} id
         * @param {String} field
         * @returns {Promise}
         */
        web_image: function(model, id, field, search_params) {
            return new Promise(async (resolve, reject) => {
                try {
                    let record = false;
                    let sfield = field;
                    console.time("webimage");
                    if (_.isEmpty(search_params)) {
                        record = await this._db.browseBinary(model, Number(id));
                    } else {
                        record = await this._db.browseBinary(
                            search_params.model,
                            Number(search_params.id)
                        );
                        sfield = search_params.field;
                    }
                    console.timeEnd("webimage");
                    if (!record) {
                        if (this.isOfflineMode()) {
                            return resolve(false);
                        }
                        return reject();
                    }
                    return resolve(record[sfield]);
                } catch (err) {
                    console.timeEnd("webimage");
                    return reject(err);
                }
            });
        },

        /**
         * HELPERS
         */

        /**
         * Resolve Many2one
         *
         * @private
         * @param {String} model
         * @param {Object} data
         * @param {Object} defaults
         */
        _process_record_create: function(model_info, data) {
            return new Promise(async resolve => {
                const records_sync = [];
                const model_info_sync = this._db.getModelInfo("sync", true);
                for (const index in data.args) {
                    const model_defaults = this._db.getModelDefaults(model_info);
                    const record = _.extend({}, model_defaults, data.args[index]);
                    // Write a temporal name
                    if (record.name) {
                        record.name += ` (Offline Record #${record.id})`;
                    } else {
                        record.name = `Offline Record #${record.id}`;
                    }
                    record.display_name = record.name;
                    const record_fields = Object.keys(record);
                    const processed_fields = [];
                    const records_linked = {};
                    for (const field of record_fields) {
                        if (!record[field] || !model_info.fields[field]) {
                            continue;
                        }
                        const field_def = model_info.fields[field];
                        if (field_def.type === "one2many") {
                            const relation = field_def.relation;
                            const field_model_info = this._db.getModelInfo(relation);
                            if (!records_linked[relation]) {
                                records_linked[relation] = [];
                            }
                            let ids_to_add = [];
                            const subrecords = [];
                            for (const command of record[field]) {
                                // Create only have 0 command
                                if (command[0] === 0) {
                                    let subrecord = command[2];
                                    // Const subrecord_fields = Object.keys(subrecord);
                                    const parent_field = _.findKey(
                                        field_model_info.fields,
                                        {
                                            required: true,
                                            relation: model_info.model,
                                        }
                                    );
                                    const model_defaults = this._db.getModelDefaults(
                                        model_info
                                    );
                                    subrecord = _.extend({}, model_defaults, subrecord);
                                    record.display_name = record.name;
                                    subrecord[parent_field] = record.id;
                                    subrecord.id = this._db.genRecordID();
                                    // Write a temporal name
                                    if (subrecord.name) {
                                        subrecord.name += ` (Offline Record #${subrecord.id})`;
                                    } else {
                                        subrecord.name = `Offline Record #${subrecord.id}`;
                                    }
                                    subrecord.display_name = subrecord.name;
                                    const link = {};
                                    link[model_info.model] = [
                                        {
                                            field: field,
                                            id: record.id,
                                            change: subrecord.id,
                                        },
                                    ];
                                    records_sync.push({
                                        model: relation,
                                        method: "create",
                                        args: [subrecord],
                                        date: new Date().getTime(),
                                        linked: link,
                                    });
                                    subrecord = await this._process_record_to_merge(
                                        subrecord,
                                        field_model_info.fields,
                                        true
                                    );
                                    // The order is not created yet, so.. ensure write
                                    // their correct values
                                    subrecord[parent_field] = [record.id, record.name];
                                    subrecords.push(subrecord);
                                    ids_to_add.push(subrecord.id);
                                    records_linked[relation].push({
                                        field: parent_field,
                                        id: subrecord.id,
                                        change: record.id,
                                    });
                                } else if (command[0] === 4) {
                                    ids_to_add.push(command[1]);
                                } else if (command[0] === 5) {
                                    ids_to_add = command[2];
                                }
                            }
                            record[field] = _.uniq(ids_to_add);
                            if (subrecords.length) {
                                await this._db.writeOrCreate(relation, subrecords);
                                processed_fields.push(field);
                            }
                        }
                    }

                    // Add main record
                    data.args[index] = await this._process_record_to_merge(
                        record,
                        model_info.fields,
                        true
                    );
                    debugger;
                    records_sync.splice(0, 0, {
                        model: model_info.model,
                        method: "create",
                        args: [_.omit(record, processed_fields)],
                        date: new Date().getTime(),
                        linked: records_linked,
                        kwargs: data.kwargs,
                    });
                    await this._db.writeOrCreate(model_info_sync, records_sync);
                }

                await this._db.writeOrCreate(model_info, data.args);
                return resolve(_.map(data.args, "id"));
            });
        },

        /**
         * Resolve Many2one
         *
         * @private
         * @param {Object} model_info
         * @param {Object} data
         * @returns {Promise}
         */
        _process_record_write: function(model_info, data) {
            return new Promise(async resolve => {
                const records_sync = [];
                const modified_records = data.args[0];
                const modifications = data.args[1];
                const modified_fields = Object.keys(modifications);
                const processed_modifs = await this._process_record_to_merge(
                    modifications,
                    model_info.fields,
                    false
                );
                const model_info_sync = this._db.getModelInfo("sync", true);
                const records = await this._db.browse(model_info, modified_records);
                for (const record of records) {
                    const data_to_sync = {};
                    for (const field of modified_fields) {
                        if (model_info.fields[field].type === "one2many") {
                            if (!record[field]) {
                                record[field] = [];
                            }
                            if (!data_to_sync[field]) {
                                data_to_sync[field] = [];
                            }
                            const relation = model_info.fields[field].relation;
                            const field_model_info = this._db.getModelInfo(relation);
                            const subrecords = [];
                            for (const command of modifications[field]) {
                                if (command[0] === 0) {
                                    let subrecord = command[2];
                                    const parent_field = _.findKey(
                                        field_model_info.fields,
                                        {
                                            required: true,
                                            relation: model_info.model,
                                        }
                                    );
                                    const model_defaults = this._db.getModelDefaults(
                                        field_model_info
                                    );
                                    subrecord = _.extend({}, model_defaults, subrecord);
                                    subrecord[parent_field] = record.id;
                                    subrecord.id = this._db.genRecordID();
                                    // Write a temporal name
                                    if (subrecord.name) {
                                        subrecord.name += ` (Offline Record #${subrecord.id})`;
                                    } else {
                                        subrecord.name = `Offline Record #${subrecord.id}`;
                                    }
                                    subrecord.display_name = subrecord.name;
                                    const link = {};
                                    link[model_info.model] = [
                                        {
                                            field: field,
                                            id: record.id,
                                            change: subrecord.id,
                                        },
                                    ];
                                    records_sync.push({
                                        model: relation,
                                        method: "create",
                                        args: [subrecord],
                                        date: new Date().getTime(),
                                        linked: link,
                                        kwargs: data.kwargs,
                                    });
                                    subrecord = await this._process_record_to_merge(
                                        subrecord,
                                        field_model_info.fields,
                                        true
                                    );
                                    subrecords.push(subrecord);
                                    record[field].push(subrecord.id);
                                } else if (command[0] === 1) {
                                    records_sync.push({
                                        model: relation,
                                        method: "write",
                                        args: [[command[1]], command[2]],
                                        date: new Date().getTime(),
                                        kwargs: data.kwargs,
                                    });
                                    const ref_record = await this._db.browse(
                                        relation,
                                        command[1]
                                    );
                                    const subrecord = await this._process_record_to_merge(
                                        command[2],
                                        field_model_info.fields
                                    );
                                    subrecords.push(_.extend(ref_record, subrecord));
                                } else if (command[0] === 2 || command[0] === 3) {
                                    if (command[0] === 2) {
                                        records_sync.push({
                                            model: relation,
                                            method: "unlink",
                                            args: [[[command[1]]]],
                                            date: new Date().getTime(),
                                            kwargs: data.kwargs,
                                        });
                                        this._db.unlink(relation, [command[1]]);
                                    }
                                    record[field] = _.reject(
                                        record[field],
                                        item => item === command[1]
                                    );
                                } else if (command[0] === 4) {
                                    record[field].push(command[1]);
                                    data_to_sync[field].push(command[1]);
                                } else if (command[0] === 5) {
                                    record[field] = [];
                                    data_to_sync[field].push([]);
                                } else if (command[0] === 6) {
                                    const data = {};
                                    data[field] = command[2];
                                    const idb_value = await this._process_record_to_merge(
                                        data,
                                        field_model_info.fields
                                    );
                                    record[field] = idb_value;
                                    data_to_sync[field] = command[2];
                                }
                            }
                            if (subrecords.length) {
                                await this._db.writeOrCreate(relation, subrecords);
                                data_to_sync[field].push(..._.map(subrecords, "id"));
                            }
                            // Ensure unique values
                            record[field] = _.uniq(record[field]);
                        } else {
                            record[field] = processed_modifs[field];
                            data_to_sync[field] = modifications[field];
                        }
                    }

                    // Update main record
                    records_sync.push({
                        model: model_info.model,
                        method: "write",
                        args: [[record.id], data_to_sync],
                        date: new Date().getTime(),
                        kwargs: data.kwargs,
                    });
                    await this._db.create(model_info_sync, records_sync);
                    await this._db.write(model_info, [record.id], record);
                }
                return resolve(true);
            });
        },

        /**
         * @private
         * @param {Object} record
         * @param {Array} fields
         * @param {Boolean} to_create
         * @returns {Promise}
         */
        _process_record_to_merge: function(record, fields, to_create) {
            return new Promise(async (resolve, reject) => {
                const processed_record = _.clone(record);
                if (Object.keys(fields).length) {
                    const model_fields = Object.keys(fields);
                    const processed_fields = [];
                    for (const field of model_fields) {
                        if (field in record) {
                            if (
                                fields[field].type === "many2one" &&
                                typeof record[field] === "number"
                            ) {
                                try {
                                    const ref_record = await this._db.browse(
                                        fields[field].relation,
                                        Number(record[field])
                                    );
                                    if (!_.isEmpty(ref_record)) {
                                        processed_record[field] = [
                                            record[field],
                                            ref_record.display_name || ref_record.name,
                                        ];
                                        processed_fields.push(field);
                                    }
                                } catch (err) {
                                    // Do nothing
                                }
                                if (processed_fields.indexOf(field) === -1) {
                                    console.log(
                                        `[ServiceWorker] Can't process '${field}' field. Can't found the relational value ${fields[field].relation} -> '${record[field]}'.`
                                    );
                                }
                            } else {
                                processed_record[field] = record[field];
                                if (field === "name") {
                                    processed_record.display_name = record[field];
                                }
                                processed_fields.push(field);
                            }
                        } else if (to_create) {
                            // The field is not present, but is used. We need set it to false because undefined
                            // values cause exceptions.
                            processed_record[field] = false;
                            processed_fields.push(field);
                        }
                    }
                    return resolve(processed_record);
                }
                return reject();
            });
        },
    });

    return SWExporterComponent;
});
