/* global Uint8Array, Dexie */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.systems.Database", function(require) {
    "use strict";

    const OdooClass = require("web.Class");
    const SQLiteDB = require("web_pwa_cache.PWA.core.db.SQLiteDB").SQLiteDB;
    const JSSandbox = require("web_pwa_cache.PWA.core.base.JSSandbox");

    const DatabaseSystem = OdooClass.extend({
        _sqlite_db_name: "oca_pwa_sqlite",
        _indexed_db_name: "oca_pwa_indexed",
        _persist_timeout: 3000,

        // Dictionary used to know when use 'search' feature
        _searchables: {},

        /**
         * @override
         */
        init: function() {
            this.sqlitedb = new SQLiteDB(this, this._sqlite_db_name);
            this.indexeddb = new Dexie(this._indexed_db_name);
            this._timer_persist = false;
            this._promise_persist = Promise.resolve();
            this.model_infos = {};
        },

        /**
         * @returns {Promise}
         */
        start: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    await this._onStartIndexedDB();
                    const sqlite_data = await this._loadSqliteData();
                    await this.sqlitedb.start(
                        this._onStartSQLiteDB.bind(this),
                        sqlite_data
                    );
                    await this.persistDatabases(true);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * Gets model info from memory
         *
         * @param {Array} model_names
         * @param {Boolean} internal
         * @param {Boolean} grouped Control if need output as dict or array
         * @returns {Object/Array}
         */
        getModelInfo: function(model_names, internal, grouped, avoid_cache) {
            return new Promise(async (resolve, reject) => {
                if (typeof model_names === "undefined") {
                    return resolve(undefined);
                }
                try {
                    if (!model_names) {
                        const model_infos = await this.sqlitedb.getModelInfo(
                            false,
                            internal,
                            grouped
                        );
                        return resolve(model_infos);
                    }
                    let is_single = false;
                    if (typeof model_names === "string") {
                        is_single = true;
                        model_names = [model_names];
                    }
                    let res = {};
                    for (const model_name of model_names) {
                        if (model_name in this.model_infos) {
                            res[model_name] = this.model_infos[model_name];
                        } else {
                            res[model_name] = await this.sqlitedb.getModelInfo(
                                model_name,
                                internal,
                                false
                            );
                            if (!avoid_cache) {
                                this.model_infos[model_name] = res[model_name];
                            }
                        }
                    }

                    res = grouped ? res : Object.values(res);
                    return resolve(!grouped && is_single ? res[0] : res);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        // -------------------
        // DB SCHEMAS
        // -------------------

        /**
         * Creates the schema of the used database:
         *  - sync: Store transactions to synchronize
         *  - config: Store PWA configurations values
         *  - userdata: Store user data configuration values
         *  - template: Store templates
         *  - model_metadata: Store model information
         *
         * @private
         * @param {SQLiteTag} db
         * @returns {Promise}
         */
        _onStartSQLiteDB: function() {
            return new Promise(async (resolve, reject) => {
                console.log("[ServiceWorker] Generating SQLite DB Schema...");

                try {
                    const model_info_model_metadata = {
                        table: this.sqlitedb.getInternalTableName("model_metadata"),
                        model: this.sqlitedb.getInternalTableName("model_metadata"),
                        internal: true,
                        fields: {
                            id: {type: "integer", store: true},
                            model: {type: "char", store: true},
                            name: {type: "char", store: true},
                            internal: {type: "boolean", store: true},
                            orderby: {type: "char", store: true},
                            rec_name: {type: "char", store: true},
                            fields: {type: "serialized", store: true},
                            view_types: {type: "serialized", store: true},
                            parent_store: {type: "char", store: true},
                            parent_name: {type: "char", store: true},
                            inherits: {type: "serialized", store: true},
                            table: {type: "char", store: true},
                            prefetch_last_update: {type: "datetime", store: true},
                            defaults: {type: "serialized", store: true},
                            valid_fields: {type: "serialized", store: true},
                        },
                    };
                    await this.sqlitedb.createTable(model_info_model_metadata);
                    await this.sqlitedb.createIndex(
                        model_info_model_metadata,
                        "model_metadata_model",
                        ["model"]
                    );
                    await this.sqlitedb.createOrUpdateRecord(
                        model_info_model_metadata,
                        model_info_model_metadata,
                        ["model"]
                    );
                } catch (err) {
                    return reject(err);
                }

                console.log("[ServiceWorker] SQLite DB Schema generated successfully");
                return resolve();
            });
        },

        /**
         * Creates the schema
         *
         * @private
         */
        _onStartIndexedDB: function() {
            console.log("[ServiceWorker] Generating Indexed DB Schema...");

            this.indexeddb.version(1).stores({
                binary: "[model+id]",
                sqlitefile: "section",
                onchange: "ref_hash",
                views:
                    "++,[model+type+view_id],[model+type+is_primary],[model+type+is_default]",
                action: "id",
                post: "[pathname+params]",
                function: "[model+method+params]",
                model_default_formula: "id,model",
                template: "xml_ref",
                userdata: "param",
                config: "param",
                sync: "++id",
            });
        },

        // -------------------
        // MANAGEMENT
        // -------------------
        _persistSqlChunk: function(data, chunk_index) {
            return this.indexeddb.sqlitefile.add({
                section: `chunk_${chunk_index}`,
                bytes: data,
            });
        },

        _persistSql: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    const CHUNK_SIZE = 36700160; // 35MiB
                    await this.sqlitedb.vacuum();
                    let sqlitefile = this.sqlitedb.getDB().export();
                    // Reset pragmas. See: https://github.com/sql-js/sql.js/issues/159
                    // this.sqlitedb.setPragmas();
                    const size = sqlitefile.byteLength;
                    await this.indexeddb.sqlitefile.clear();
                    let chunks = 0;
                    let offset = 0;
                    for (; offset < size; ++chunks) {
                        const chunk_data = sqlitefile.subarray(0, CHUNK_SIZE);
                        const wsize = chunk_data.byteLength;
                        await this.indexeddb.sqlitefile.add({
                            section: `chunk_${chunks}`,
                            bytes: chunk_data,
                        });
                        if (wsize === 0) {
                            break;
                        }
                        // Free memory as soon as possible
                        sqlitefile = sqlitefile.subarray(wsize);
                        offset += wsize;
                    }
                    // Write last part if needed
                    if (offset !== size) {
                        return reject(
                            "The amount of bytes written doesn't match with the real size of the sqlite file"
                        );
                    }

                    await this.indexeddb.sqlitefile.add({
                        section: "metadata",
                        data: {
                            filesize: size,
                            chunks: chunks,
                        },
                    });

                    return resolve();
                } catch (err) {
                    return reject(err);
                }
            });
        },

        _loadSqliteData: function() {
            return new Promise(async (resolve, reject) => {
                let metadata = null;
                try {
                    metadata = await this.indexeddb.sqlitefile
                        .where("section")
                        .equals("metadata")
                        .first();
                    metadata = metadata ? metadata.data : false;
                } catch (err) {
                    metadata = false;
                }
                if (!metadata || !metadata.filesize) {
                    return resolve(new Uint8Array(0));
                }

                const buffer = new Uint8Array(metadata.filesize); // Allocate required memory
                let offset = 0;
                for (
                    let chunk_index = 0;
                    chunk_index < metadata.chunks;
                    ++chunk_index
                ) {
                    const record = await this.indexeddb.sqlitefile
                        .where("section")
                        .equals(`chunk_${chunk_index}`)
                        .first();
                    if (_.isEmpty(record)) {
                        return reject("Expected bytes to copy!");
                    }
                    buffer.set(record.bytes, offset);
                    offset += record.bytes.byteLength;
                }

                if (offset !== metadata.filesize) {
                    return reject(
                        "Copied size doesn't match with the size of the sqlite file!"
                    );
                }

                return resolve(buffer);
            });
        },

        /**
         * This is critical method!
         * When call "export" we make a copy of the database.
         * We will need twice the memory required just to host the database.
         *
         * @param {Boolean} instant
         * @returns {Promise}
         */
        persistDatabases: function(instant) {
            return new Promise(resolve => {
                // Save sqlitejs
                if (this._timer_persist) {
                    clearTimeout(this._timer_persist);
                    this._timer_persist = false;
                }
                const chain_promise = () => {
                    this._promise_persist = this._promise_persist.then(() =>
                        this._persistSql().then(() => resolve())
                    );
                };
                if (instant) {
                    chain_promise();
                } else {
                    this._timer_persist = setTimeout(
                        chain_promise,
                        this._persist_timeout
                    );
                }
            });
        },

        // -------------------
        // RECORDS
        // -------------------

        /**
         * @param {Object/String} model_info
         * @param {Array} datas
         * @returns {Promise}
         */
        create: function(model_info, datas) {
            return new Promise(async (resolve, reject) => {
                try {
                    const tasks = [];
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }
                    if (!(datas instanceof Array)) {
                        datas = [datas];
                    }
                    const binary_fields = this._getFieldNamesByType(
                        model_info,
                        "binary"
                    );
                    for (const values of datas) {
                        tasks.push(
                            this.sqlitedb.createRecord(
                                model_info,
                                _.omit(values, binary_fields)
                            )
                        );
                        if (binary_fields.length) {
                            const binary_fields_values = _.chain(values)
                                .pick(binary_fields)
                                .extend({
                                    model: model_info.model,
                                    id: values.id,
                                })
                                .value();
                            // Two because we force "id" and "model" fields
                            if (Object.keys(binary_fields_values).length > 2) {
                                tasks.push(
                                    this.indexeddb.binary.add(binary_fields_values)
                                );
                            }
                        }
                    }
                    await Promise.all(tasks);
                    return resolve();
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} rc_ids
         * @param {Object} data
         * @returns {Promise}
         */
        write: function(model_info, rc_ids, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    const sdata = _.omit(data, "id");
                    const binary_fields = this._getFieldNamesByType(
                        model_info,
                        "binary"
                    );
                    const tasks = [];
                    for (const id of rc_ids) {
                        tasks.push(
                            this.sqlitedb.updateRecord(
                                model_info,
                                [id],
                                _.chain(sdata)
                                    .omit(binary_fields)
                                    .value()
                            )
                        );
                        if (binary_fields.length) {
                            const binary_fields_values = _.chain(sdata)
                                .pick(binary_fields)
                                .extend({
                                    model: model_info.model,
                                    id: id,
                                })
                                .value();
                            // Two because we force "id" and "model" fields
                            if (Object.keys(binary_fields_values).length > 2) {
                                tasks.push(
                                    this.indexeddb.binary.put(binary_fields_values)
                                );
                            }
                        }
                    }
                    const res = await Promise.all(tasks);
                    return resolve(res);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @param {Object/String} model_info
         * @param {Array} datas
         * @param {Object} options
         * @returns {Promise}
         */
        writeOrCreate: function(model_info, datas, options) {
            return new Promise(async resolve => {
                const soptions = options || {};
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    const binary_fields =
                        soptions.binary_fields ||
                        this._getFieldNamesByType(model_info, "binary");
                    for (const values of datas) {
                        await this.sqlitedb.createOrUpdateRecord(
                            model_info,
                            _.chain(values)
                                .omit(binary_fields)
                                .value(),
                            ["id"]
                        );
                        if (binary_fields.length) {
                            await this.indexeddb.binary.put(
                                _.chain(values)
                                    .pick(_.union(["id"], binary_fields))
                                    .extend({model: model_info.model})
                                    .value()
                            );
                        }
                    }
                } catch (err) {
                    // Do nothing
                }

                return resolve();
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} rc_ids
         * @returns {Promise}
         */
        unlink: function(model_info, rc_ids) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    await this.sqlitedb.deleteRecords(model_info, rc_ids);
                    // Try remove binary... maybe doesn't exists
                    try {
                        const tasksbinary = [];
                        if (_.isEmpty(rc_ids)) {
                            const records = await this.indexeddb.binary
                                .where("model")
                                .equals(model_info.model);
                            for (const record of records) {
                                tasksbinary.push(
                                    this.indexeddb.binary
                                        .where({
                                            model: model_info.model,
                                            id: record.id,
                                        })
                                        .delete()
                                );
                            }
                        } else {
                            for (const id of rc_ids) {
                                tasksbinary.push(
                                    this.indexeddb.binary
                                        .where({
                                            model: model_info.model,
                                            id: id,
                                        })
                                        .delete()
                                );
                            }
                        }

                        await Promise.all(tasksbinary);
                    } catch (err) {
                        // Nothing to do
                    }
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} domain
         * @param {Number} limit
         * @param {Array} fields
         * @param {Number} offset
         * @param {String} orderby (Example: "name DESC, city, sequence ASC")
         * @param {Boolean} count
         * @returns {Promise}
         */
        search: function(
            model_info,
            domain,
            limit,
            fields,
            offset,
            orderby,
            count = false,
            context = false
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }
                    if (!model_info) {
                        return reject("Model info not found!");
                    }

                    const records = await this.sqlitedb._osv.query(
                        model_info,
                        domain || [],
                        offset,
                        limit,
                        orderby,
                        fields,
                        count,
                        context
                    );
                    if (count) {
                        return resolve(records);
                    }
                    if (_.isEmpty(records)) {
                        return resolve(limit === 1 ? undefined : []);
                    }
                    this.sqlitedb.converter.toOdoo(model_info.fields, records);
                    return resolve(limit === 1 ? records[0] : records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} domain
         * @param {Number} limit
         * @param {Array} fields
         * @param {Number} offset
         * @param {String} orderby (Example: "name DESC, city, sequence ASC")
         * @param {Object} context
         * @returns {Promise}
         */
        search_read: function(
            model_info,
            domain,
            limit,
            fields,
            offset,
            orderby,
            context
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    const records = await this.search(
                        model_info,
                        domain,
                        limit,
                        fields || [],
                        offset,
                        orderby,
                        false,
                        context
                    );
                    return resolve(records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         *
         * @param {Object/String} model_info
         * @param {String/Array} search
         * @param {Array} domain
         * @param {String} operator
         * @param {Number} limit
         * @returns {Promise}
         */
        name_search: function(
            model_info,
            search,
            domain,
            operator = "ilike",
            limit = 0,
            context = false
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }
                    if (search) {
                        const name_search =
                            model_info.rec_name === "name"
                                ? "display_name"
                                : model_info.rec_name;
                        domain = _.union([[name_search, operator, search]], domain);
                    }
                    let records = await this.search_read(
                        model_info.model,
                        domain,
                        limit,
                        ["id", "display_name"],
                        undefined,
                        undefined,
                        context
                    );
                    records = records.map(item => _.values(item));
                    return resolve(records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Number/Array} rc_ids
         * @param {Array} fields
         * @returns {Promise}
         */
        browse: function(model_info, rc_ids, fields) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    if (!model_info) {
                        return reject(`The model has not found!`);
                    }

                    const s_rc_ids = rc_ids instanceof Array ? rc_ids : [rc_ids];
                    const records = await this.sqlitedb.getRecords(
                        model_info,
                        s_rc_ids,
                        fields
                    );
                    if (_.isEmpty(records)) {
                        return resolve(_.isNumber(rc_ids) ? undefined : []);
                    }
                    return resolve(_.isNumber(rc_ids) ? records[0] : records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Number} rc_id
         * @returns {Promise}
         */
        browseBinary: function(model, rc_id) {
            return this.indexeddb.binary.get({
                model: model,
                id: rc_id,
            });
        },

        /**
         * @param {Object} model_info
         * @param {Array} domain
         * @returns {Promise}
         */
        count: function(model_info, domain) {
            return this.search(model_info, domain, false, false, false, false, true);
        },

        /**
         * @param {String} xmlid
         * @returns {Promise}
         */
        ref: function(xmlid) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_data = await this.getModelData(xmlid);
                    if (_.isEmpty(model_data)) {
                        return reject(`Model data not found for '${xmlid}'`);
                    }
                    let record = {};
                    if (model_data.model.startsWith("ir.actions.")) {
                        record = await this.indexeddb.action.get(model_data.res_id);
                    } else {
                        const records = await this.browse(
                            model_data.model,
                            model_data.res_id
                        );
                        if (records.length) {
                            record = records[0];
                        }
                    }

                    if (_.isEmpty(record)) {
                        return reject(`Record not found for '${xmlid}'`);
                    }

                    return resolve(record);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Number} uid
         * @param {Number} action_id
         * @returns {Promise}
         */
        getModelFilters: function(model_info, uid, action_id) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    const action_domain = [];
                    if (action_id) {
                        action_domain.push(["action_id", "in", [action_id, false]]);
                    }
                    const records = await this.search_read(
                        "ir.filters",
                        _.union(action_domain, [
                            ["model_id", "=", model_info.model],
                            ["user_id", "in", [uid, false]],
                        ])
                    );
                    if (!records.length) {
                        return resolve([]);
                    }
                    const filters = _.map(records, item =>
                        _.pick(item, [
                            "name",
                            "is_default",
                            "domain",
                            "context",
                            "user_id",
                            "sort",
                        ])
                    );
                    return resolve(filters);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Number} uid
         * @param {Array} views
         * @param {Object} options
         * @param {Object} context
         * @returns {Promise}
         */
        getFieldsViews: function(model_info, uid, views, options, context) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    const res = {};
                    if (options && options.load_filters) {
                        res.filters = await this.getModelFilters(
                            model_info,
                            uid,
                            options.action_id
                        );
                        if (_.isEmpty(res.filters)) {
                            res.filters = {};
                        }
                    }

                    const n_views = views;
                    if (options.standalone) {
                        n_views.push([false, "formPWA"]);
                    }
                    res.fields = model_info.fields;
                    res.fields_views = {};
                    for (const [view_id, view_type] of n_views) {
                        const s_view_type = view_type === "list" ? "tree" : view_type;
                        let views_info = [];
                        if (view_id) {
                            views_info = await this.indexeddb.views
                                .where("[model+type+view_id]")
                                .equals([model_info.model, s_view_type, view_id])
                                .toArray();
                        } else {
                            // If not view found try reference
                            const view_ref_key = `${view_type}_view_ref`;
                            const view_ref = context[view_ref_key];
                            if (view_ref) {
                                const model_data = await this.getModelData(view_ref);
                                if (!_.isEmpty(model_data) && model_data.res_id) {
                                    views_info = await this.indexeddb.views
                                        .where("[model+type+view_id]")
                                        .equals([
                                            model_info.model,
                                            s_view_type,
                                            model_data.res_id,
                                        ])
                                        .toArray();
                                }
                            }
                        }

                        if (_.isEmpty(views_info)) {
                            // If all fails, try primary
                            views_info = await this.indexeddb.views
                                .where("[model+type+is_primary]")
                                .equals([model_info.model, s_view_type, 1])
                                .toArray();
                        }

                        if (_.isEmpty(views_info)) {
                            // If all fails, fallback to default view
                            views_info = await this.indexeddb.views
                                .where("[model+type+is_default]")
                                .equals([model_info.model, s_view_type, 1])
                                .toArray();
                        }

                        // If can't get all views definitions, we
                        // return an empty result to trigger the Odoo response
                        // Except for 'formPWA' that is an special view type
                        if (_.isEmpty(views_info)) {
                            if (s_view_type === "formPWA") {
                                // If not view found for formPWA, use primary from
                                // If all fails, try primary
                                views_info = await this.indexeddb.views
                                    .where("[model+type+is_primary]")
                                    .equals([model_info.model, "form", 1])
                                    .toArray();
                                // Last try, search for default
                                if (_.isEmpty(views_info)) {
                                    views_info = await this.indexeddb.views
                                        .where("[model+type+is_default]")
                                        .equals([model_info.model, "form", 1])
                                        .toArray();
                                }
                            } else {
                                return resolve([]);
                            }
                        }

                        if (_.isEmpty(views_info)) {
                            return reject(
                                `View '${s_view_type}' for ${model_info.model} not found!`
                            );
                        }

                        // Resolve views 'toolbar'
                        const require_toolbar = !_.isEmpty(options) && options.toolbar;
                        if (views_info.length === 1) {
                            if (require_toolbar) {
                                res.fields_views[view_type] = views_info[0];
                            } else {
                                res.fields_views[view_type] = _.omit(
                                    views_info[0],
                                    "toolbar"
                                );
                            }
                        } else {
                            let selected_view = false;
                            for (const view_info of views_info) {
                                const has_toolbar = !_.isEmpty(
                                    _.chain(view_info.toolbar)
                                        .values()
                                        .flatten()
                                        .value()
                                );
                                if (
                                    (require_toolbar && has_toolbar) ||
                                    (!require_toolbar && !has_toolbar)
                                ) {
                                    selected_view = view_info;
                                    break;
                                }
                            }
                            res.fields_views[view_type] = selected_view
                                ? selected_view
                                : views_info[0];
                        }
                    }

                    if (options.standalone && "formPWA" in res.fields_views) {
                        res.fields_views.form = res.fields_views.formPWA;
                    }

                    return resolve(res);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} fields
         * @param {String} type
         * @returns {Promise}
         */
        getModelFieldsInfo: function(model_info, fields, type) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    if (!fields) {
                        fields = _.keys(model_info.fields);
                    }
                    const field_infos = {};
                    for (const field of fields) {
                        if (!type || model_info.fields[field].type === type) {
                            field_infos[field] = model_info.fields[field];
                        }
                    }
                    return resolve(field_infos);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        read_subscription_data: function(res_model, follower_id) {
            return new Promise(async (resolve, reject) => {
                try {
                    const followers = await this._dbmanager.browse("mail.followers", [
                        follower_id,
                    ]);
                    const followers_subtypes = _.chain(followers)
                        .map("subtype_ids")
                        .flatten()
                        .value();

                    // Find current model subtypes, add them to a dictionary
                    const subtypes = await this._dbmanager.search(
                        "mail.message.subtype",
                        [
                            "&",
                            ("hidden", "=", false),
                            "|",
                            ("res_model", "=", res_model),
                            ("res_model", "=", false),
                        ]
                    );
                    let subtypes_list = [];
                    for (const subtype of subtypes) {
                        const subtype_parent_id = await this._dbmanager.browse(
                            "res.partner",
                            [subtype.parent_id[0]]
                        );
                        subtypes_list.push({
                            name: subtype.name,
                            res_model: subtype.res_model,
                            sequence: subtype.sequence,
                            default: subtype.default,
                            internal: subtype.internal,
                            followed: subtype.id in followers_subtypes,
                            parent_model: subtype_parent_id.res_model,
                            id: subtype.id,
                        });
                    }
                    subtypes_list = _.chain(subtypes_list)
                        .orderBy("parent_model")
                        .orderBy("res_model")
                        .orderBy("internal")
                        .orderBy("sequence")
                        .value();
                    return resolve(subtypes_list);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         *
         * @param {Object/String} model_info
         * @param {Number} rec_id
         * @returns {Promise}
         */
        isOfflineRecord: function(model_info, rec_id) {
            return new Promise(async resolve => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }
                    const sync_records = await this.indexeddb.sync
                        .where("[model+method]")
                        .equals([model_info.model, "create"])
                        .toArray();
                    const record = _.findWhere(
                        sync_records,
                        item => item.args[0].id === rec_id
                    );
                    if (record) {
                        return resolve(true);
                    }
                    return resolve(false);
                } catch (err) {
                    return resolve(false);
                }
            });
        },

        /**
         * Generates a temporal id for offline records.
         * Odoo only works with numbers.
         *
         * @returns {Number}
         */
        genRecordID: function() {
            return 90000000 + new Date().getTime();
        },

        /**
         * @param {String/Object} model_info
         * @param {String} field_name
         * @param {String} operator
         * @param {Any} right
         * @param {Object} context
         * @returns {Promise}
         */
        determineDomain: function(model_info, field_name, operator, right, context) {
            return this[this._searchables[model_info.model][field_name]](
                operator,
                right,
                context
            );
        },

        // -------------------
        // HELPERS
        // -------------------

        ids: function(records, field) {
            const field_id = field || "id";
            return _.map(records, record => record[field_id]);
        },

        /**
         * @param {String/Object} model_info
         * @param {String} field_name
         * @param {Object} field_def
         * @returns {Boolean}
         */
        hasSearchFunction: function(model_info, field_name, field_def) {
            return (
                !field_def.store &&
                field_def.searchable &&
                Object.prototype.hasOwnProperty.call(
                    this._searchables,
                    model_info.model
                ) &&
                Object.prototype.hasOwnProperty.call(
                    this._searchables[model_info.model],
                    field_name
                )
            );
        },

        /**
         * @param {String} xmlid
         * @returns {Promise}
         */
        getModelData: function(xmlid) {
            return new Promise(async (resolve, reject) => {
                const module_name = xmlid.split(".", 1)[0];
                const name = xmlid.substr(module_name.length + 1);
                try {
                    const records = await this.search_read(
                        "ir.model.data",
                        [
                            ["module", "=", module_name],
                            ["name", "=", name],
                        ],
                        1
                    );
                    if (_.isEmpty(records)) {
                        return reject(`No model data found for '${xmlid}'...`);
                    }
                    return resolve(records[0]);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @returns {Promise}
         */
        getModelDefaults: function(model_info) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.getModelInfo(model_info);
                    }

                    const values = model_info.defaults || {};
                    const records = await this.indexeddb.model_default_formula
                        .where("model")
                        .equals(model_info.model)
                        .toArray();
                    const sandbox = new JSSandbox();
                    for (const record of records) {
                        if (!record.formula) {
                            continue;
                        }
                        record.formula = this.sqlitedb.converter.parseJson(
                            record,
                            "formula"
                        );
                        sandbox.compile(record.formula);
                        _.extend(values, sandbox.run());
                    }
                    if (
                        _.isEmpty(values) &&
                        (model_info.defaults === false ||
                            model_info.defaults === null ||
                            typeof model_info.defaults === "undefined")
                    ) {
                        return reject(
                            `Can't found default values for the model '${model_info.model}'`
                        );
                    }
                    return resolve(values);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Helper function to obtain the associated onchange by the request parameters
         *
         * @param {Array} records
         * @param {String} onchange_field
         * @param {Object} record_data
         * @returns {Array}
         */
        filterOnchangeRecordsByParams: function(records, onchange_field, record_data) {
            const res = [];
            var params = _.pick(record_data, onchange_field);
            const _cached_trigger_params = {};
            for (const record of records) {
                // Construct params using "trigger" fields
                if (record.triggers) {
                    if (_cached_trigger_params[record.triggers]) {
                        _.extend(params, _cached_trigger_params[record.triggers]);
                    } else {
                        const trigger_fields = record.triggers.split(",");
                        for (const field of trigger_fields) {
                            const sfield = field.trim();
                            if (!sfield.includes(".")) {
                                params[sfield] = record_data[sfield];
                                continue;
                            }
                            const levels = sfield.split(".");
                            var value = record_data;
                            var temp_arr_value = params;
                            var last_level = levels[0];
                            for (var index = 0; index < levels.length; ++index) {
                                const level = levels[index];
                                if (!temp_arr_value[level]) {
                                    temp_arr_value[level] = {};
                                }
                                if (index < levels.length - 1) {
                                    temp_arr_value = temp_arr_value[level];
                                }
                                value = value[level];
                                last_level = level;
                            }
                            temp_arr_value[last_level] = value;
                        }

                        _cached_trigger_params[record.triggers] = params;
                    }
                }

                if (_.isEqual(record.params, params)) {
                    res.push(record);
                    continue;
                }
                let is_full_match = true;
                for (const field_name in params) {
                    const record_param_value = record.params[field_name];
                    if (!record_param_value) {
                        is_full_match = false;
                        break;
                    }
                    if (
                        record_param_value instanceof Array &&
                        record_param_value.length === 3
                    ) {
                        // Check 'params commands'
                        if (
                            record_param_value[0] === "r" &&
                            (params[field_name] < record_param_value[1] ||
                                params[field_name] > record_param_value[2])
                        ) {
                            is_full_match = false;
                            break;
                        }
                    } else if (!_.isEqual(record_param_value, params[field_name])) {
                        is_full_match = false;
                        break;
                    }
                }
                if (is_full_match) {
                    res.push(record);
                }
            }
            return res;
        },

        /**
         * Remove old records
         *
         * @param {String} model
         * @param {Array} oids
         * @returns {Promise}
         */
        vacuumRecords: function(model, oids) {
            return new Promise(async (resolve, reject) => {
                try {
                    const records = await this.search_read(model, []);
                    const cur_ids = _.map(records, "id");
                    const ids_to_remove = _.difference(oids, cur_ids);
                    if (!_.isEmpty(ids_to_remove)) {
                        await this.unlink(model, ids_to_remove);
                    }
                    return resolve(ids_to_remove);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @param {Object} model_info
         * @param {String} field_type
         * @returns {Promise}
         */
        _getFieldNamesByType: function(model_info, field_type) {
            return _.chain(model_info.fields)
                .pick(item => item.type === field_type)
                .keys()
                .value();
        },
    });

    return DatabaseSystem;
});
