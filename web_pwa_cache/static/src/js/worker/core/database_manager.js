/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.DatabaseManager", function (require) {
    "use strict";

    const ParentedMixin = require('web.mixins').ParentedMixin;
    const OdooClass = require("web.Class");
    const SQLiteDB = require("web_pwa_cache.PWA.core.db.SQLiteDB");
    const IndexedDB = require("web_pwa_cache.PWA.core.db.IndexedDB");


    const DatabaseManager = OdooClass.extend(ParentedMixin, {
        _sqlite_db_name: 'oca_pwa_sqlite',
        _indexed_db_name: 'oca_pwa_indexed',

        /**
         * @override
         * @param {DatabaseManagerClass} db
         */
        init: function (parent) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
            this.sqlitedb = new SQLiteDB(this, this._sqlite_db_name);
            this.indexeddb = new IndexedDB(this, this._indexed_db_name);
        },

        /**
         * @returns {Promise}
         */
        start: function () {
            return Promise.all([
                this.sqlitedb.start(this._onStartSQLiteDB.bind(this)),
                this.indexeddb.start(this._onStartIndexedDB.bind(this)),
            ]);
        },

        //-------------------
        // DB SCHEMAS
        //-------------------

        /**
         * Creates the schema of the used database:
         *  - views: Store views
         *  - actions: Store actions
         *  - sync: Store transactions to synchronize
         *  - config: Store PWA configurations values
         *  - functions: Store function calls results
         *  - post: Store post calls results
         *  - userdata: Store user data configuration values
         *  - onchange: Store onchange values
         *  - template: Store templates
         *  - model_metadata: Store model information
         *
         * @private
         * @param {IDBDatabaseEvent} evt
         */
        _onStartSQLiteDB: function (db) {
            return new Promise(async (resolve, reject) => {
                console.log("[ServiceWorker] Generating SQLite DB Schema...");
                try {
                    const model_info_model_metadata = {
                        table: this.sqlitedb.getInternalTableName('model_metadata'),
                        model: this.sqlitedb.getInternalTableName('model_metadata'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            name: {type: 'char', store: true},
                            internal: {type: 'boolean', store: true},
                            orderby: {type: 'char', store: true},
                            rec_name: {type: 'char', store: true},
                            fields: {type: 'json', store: true},
                            view_types: {type: 'json', store: true},
                            parent_store: {type: 'char', store: true},
                            parent_name: {type: 'char', store: true},
                            inherits: {type: 'json', store: true},
                            table: {type: 'char', store: true},
                            prefetch_last_update: {type: 'datetime', store: true},
                            defaults: {type: 'json', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_model_metadata);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS model_metadata_model ON ${this.sqlitedb.getInternalTableName('model_metadata')} (model)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_model_metadata, ["model"]);

                    const model_info_views = {
                        table: this.sqlitedb.getInternalTableName('views'),
                        model: this.sqlitedb.getInternalTableName('views'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            name: {type: 'char', store: true},
                            type: {type: 'char', store: true},
                            model: {type: 'char', store: true},
                            fields: {type: 'json', store: true},
                            base_model: {type: 'char', store: true},
                            field_parent: {type: 'char', store: true},
                            toolbar: {type: 'char', store: true},
                            arch: {type: 'char', store: true},
                            view_id: {type: 'many2one', store: true},
                            standalone: {type: 'boolean', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_views);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS views_model_view_id_type ON ${this.sqlitedb.getInternalTableName('views')} (model, view_id, type)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_views, ["model"]);

                    const model_info_actions = {
                        table: this.sqlitedb.getInternalTableName('actions'),
                        model: this.sqlitedb.getInternalTableName('actions'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            flags: {type: 'json', store: true},
                            display_name: {type: 'char', store: true},
                            create_date: {type: 'datetime', store: true},
                            view_ids: {type: 'one2many', store: true},
                            write_uid: {type: 'many2one', store: true},
                            name: {type: 'char', store: true},
                            type: {type: 'selection', store: true},
                            res_model: {type: 'char', store: true},
                            search_view: {type: 'text', store: true},
                            create_uid: {type: 'many2one', store: true},
                            filter: {type: 'char', store: true},
                            target: {type: 'selection', store: true},
                            groups_id: {type: 'many2many', store: true},
                            limit: {type: 'integer', store: true},
                            view_mode: {type: 'selection', store: true},
                            views: {type: 'json', store: true},
                            context: {type: 'json', store: true},
                            auto_search: {type: 'boolean', store: true},
                            help: {type: 'html', store: true},
                            search_view_id: {type: 'many2one', store: true},
                            res_id: {type: 'integer', store: true},
                            write_date: {type: 'datetime', store: true},
                            domain: {type: 'char', store: true},
                            src_model: {type: 'char', store: true},
                            view_id: {type: 'many2one', store: true},
                            binding_type: {type: 'selection', store: true},
                            xml_id: {type: 'char', store: true},
                            usage: {type: 'selection', store: true},
                            binding_model_id: {type: 'many2one', store: true},
                            multi: {type: 'boolean', store: true},
                            link_field_id: {type: 'many2one', store: true},
                            crud_model_id: {type: 'many2one', store: true},
                            activity_user_id: {type: 'many2one', store: true},
                            activity_date_deadline_range: {type: 'integer', store: true},
                            child_ids: {type: 'one2many', store: true},
                            model_id: {type: 'many2one', store: true},
                            activity_note: {type: 'html', store: true},
                            crud_model_name: {type: 'char', store: true},
                            state: {type: 'selection', store: true},
                            code: {type: 'char', store: true},
                            activity_type_id: {type: 'many2one', store: true},
                            fields_lines: {type: 'one2many', store: true},
                            partner_ids: {type: 'many2many', store: true},
                            website_path: {type: 'char', store: true},
                            channel_ids: {type: 'one2many', store: true},
                            activity_user_field_name: {type: 'char', store: true},
                            activity_user_type: {type: 'selection', store: true},
                            sequence: {type: 'integer', store: true},
                            activity_summary: {type: 'char', store: true},
                            website_published: {type: 'boolean', store: true},
                            website_url: {type: 'char', store: true},
                            template_id: {type: 'many2one', store: true},
                            activity_date_deadline_range_type: {type: 'selection', store: true},
                            model_name: {type: 'char', store: true},
                            params_store: {type: 'json'},
                            tag: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            __last_update: {type: 'datetime', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_actions);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_actions, ["model"]);

                    const model_info_sync = {
                        table: this.sqlitedb.getInternalTableName('sync'),
                        model: this.sqlitedb.getInternalTableName('sync'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            args: {type: 'json', store: true},
                            date: {type: 'datetime', store: true},
                            linked: {type: 'json', store: true},
                            kwargs: {type: 'json', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_sync);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_sync, ["model"]);

                    const model_info_config = {
                        table: this.sqlitedb.getInternalTableName('config'),
                        model: this.sqlitedb.getInternalTableName('config'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            param: {type: 'char', store: true},
                            value: {type: 'json', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_config);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS config_param ON ${this.sqlitedb.getInternalTableName('config')} (param)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_config, ["model"]);

                    const model_info_function = {
                        table: this.sqlitedb.getInternalTableName('function'),
                        model: this.sqlitedb.getInternalTableName('function'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            method: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            result: {type: 'json', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_function);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS function_model_method_params ON ${this.sqlitedb.getInternalTableName('function')} (model, method, params)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_function, ["model"]);

                    const model_info_post = {
                        table: this.sqlitedb.getInternalTableName('post'),
                        model: this.sqlitedb.getInternalTableName('post'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            pathname: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            result: {type: 'json', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_post);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS post_pathname_params ON ${this.sqlitedb.getInternalTableName('post')} (pathname, params)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_post, ["model"]);

                    const model_info_userdata = {
                        table: this.sqlitedb.getInternalTableName('userdata'),
                        model: this.sqlitedb.getInternalTableName('userdata'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            param: {type: 'char', store: true},
                            value: {type: 'json', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_userdata);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS userdata_param ON ${this.sqlitedb.getInternalTableName('userdata')} (param)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_userdata, ["model"]);

                    const model_info_onchange = {
                        table: this.sqlitedb.getInternalTableName('onchange'),
                        model: this.sqlitedb.getInternalTableName('onchange'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            field: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            changes: {type: 'json', store: true},
                            formula: {type: 'text', store: true},
                            triggers: {type: 'char', store: true},
                            field_value: {type: 'json', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_onchange);
                    await db.query([`CREATE INDEX IF NOT EXISTS onchange_model_field_field_value ON ${this.sqlitedb.getInternalTableName('onchange')} (model, field, field_value)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_onchange, ["model"]);

                    const model_info_template = {
                        table: this.sqlitedb.getInternalTableName('template'),
                        model: this.sqlitedb.getInternalTableName('template'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            xml_ref: {type: 'char', store: true},
                            template: {type: 'text', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_template);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS template_xml_ref ON ${this.sqlitedb.getInternalTableName('template')} (xml_ref)`]);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_template, ["model"]);

                    const model_info_defaults = {
                        table: this.sqlitedb.getInternalTableName('defaults'),
                        model: this.sqlitedb.getInternalTableName('defaults'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            formula: {type: 'text', store: true},
                        }
                    };
                    await this.sqlitedb.createTable(model_info_defaults);
                    await this.sqlitedb.createOrUpdateRecord(model_info_model_metadata, model_info_defaults, ["model"]);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * Creates the schema of the used database:
         *  - binary: Store records to improve
         *                search performance
         *
         * @private
         * @param {IDBDatabaseEvent} evt
         */
        _onStartIndexedDB: function (evt) {
            console.log("[ServiceWorker] Generating Indexed DB Schema...");
            const db = evt.target.result;
            if (evt.oldVersion < 1) { // New Database
                let store = db.createObjectStore("binary", {
                    keyPath: ["model", "id"],
                    unique: true,
                });
                store.createIndex("model", "model", {unique: false});
            } else {
                // Upgrade Database
                // switch (evt.oldVersion) {
                //     case 1: {
                //         console.log("[ServiceWorker] Updating Old DB Schema to v2...");
                //         ...
                //     }
                //     case 2: {
                //         console.log("[ServiceWorker] Updating Old DB Schema to v3...");
                //         ...
                //     }
                // }
            }
        },

        //-------------------
        // RECORDS
        //-------------------

        /**
         * @param {Object/String} model
         * @param {Object} data
         * @returns {Promise}
         */
        create: function (model_info, datas) {
            return new Promise(async (resolve, reject) => {
                try {
                    const tasks = [];
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }
                    if (!(datas instanceof Array)) {
                        datas = [datas];
                    }
                    const binary_fields = this._getFieldNamesByType(model_info, "binary");
                    for (let values of datas) {
                        tasks.push(this.sqlitedb.createRecord(model_info, _.omit(values, binary_fields)));
                        if (binary_fields.length) {
                            tasks.push(this.indexeddb.createRecord("binary", _.chain(sdata).pick(_.union(["id"], binary_fields)).extend({model: model_info.model, id: values.id}).value()));
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
        write: function (model_info, rc_ids, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    const sdata = _.omit(data, 'id');
                    const binary_fields = this._getFieldNamesByType(model_info, "binary");
                    const tasks = [];
                    for (let id of rc_ids) {
                        tasks.push(this.sqlitedb.updateRecord(model_info, [id], _.chain(sdata).omit(binary_fields).value()));
                        if (binary_fields.length) {
                            tasks.push(this.indexeddb.updateRecords("binary", false, [model_info.model, id], _.chain(sdata).pick(_.union(["id"], binary_fields)).extend({model: model_info.model, id: id}).value()));
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
         * @param {Boolean} allow_create
         * @returns {Promise}
         */
        writeOrCreate: function (model_info, datas, allow_create) {
            return new Promise(async (resolve) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    const binary_fields = this._getFieldNamesByType(model_info, "binary");
                    const tasks = [];
                    for (let values of datas) {
                        tasks.push(this.sqlitedb.createOrUpdateRecord(model_info, _.chain(values).omit(binary_fields).value(), ["id"]));
                        if (binary_fields.length) {
                            tasks.push(this.indexeddb.createOrUpdateRecord("binary", false, [model_info.model, values.id], _.chain(values).pick(_.union(["id"], binary_fields)).extend({model: model_info.model}).value()));
                        }
                    }
                    await Promise.all(tasks);
                } catch (err) {
                    // do nothing
                }

                return resolve();
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} domain
         * @returns {Promise}
         */
        unlink: function (model_info, rc_ids) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    const tasks = [this.sqlitedb.deleteRecords(model_info, rc_ids)];
                    if (!rc_ids) {
                        const records = await this.indexeddb.getRecords("binary", "model", model_info.model);
                        for (let record of records) {
                            tasks.push(this.indexeddb.deleteRecord("binary", [model_info.model, record.id]));
                        }
                    } else {
                        for (const id of rc_ids) {
                            tasks.push(this.indexeddb.deleteRecord("binary", [model_info.model, id]));
                        }
                    }
                    await Promise.all(tasks);
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * @param {Object/String} model
         * @param {Array} domain
         * @param {Number} limit
         * @param {Number} offset
         * @param {String} orderby (Example: "name DESC, city, sequence ASC")
         * @param {Boolean} lazy
         * @param {Boolean} count
         * @return {Promise[Array[Object]]}
         */
        search: function (
            model_info,
            domain,
            limit,
            fields,
            offset,
            orderby,
            count=false
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }
                    if (!model_info) {
                        return reject("Model info not found!");
                    }

                    const records = await this.sqlitedb._osv.query(model_info, domain, offset, limit, orderby, fields, count);
                    if (_.isEmpty(records)) {
                        if (count) {
                            return resolve(0);
                        }
                        return resolve(limit === 1 ? undefined : []);
                    }
                    this.sqlitedb._parseValues(model_info.fields, records);
                    return resolve(limit === 1 ? records[0] : records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model
         * @param {Array} domain
         * @param {Number} limit
         * @param {Number} offset
         * @param {String} orderby (Example: "name DESC, city, sequence ASC")
         * @return {Promise[Array[Object]]}
         */
        search_read: function (
            model_info,
            domain,
            limit,
            fields,
            offset,
            orderby
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    const records = await this.search(model_info, domain, limit, fields || [], offset, orderby);
                    return resolve(records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Number/Array[Number]} rc_ids
         * @returns {Promise[Array[Object]]}
         */
        browse: function (model_info, rc_ids) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    if (!model_info) {
                        return  reject(`The model has not found!`);
                    }

                    const s_rc_ids = (rc_ids instanceof Array)?rc_ids:[rc_ids];
                    const records = await this.sqlitedb.getRecords(model_info, s_rc_ids);
                    if (typeof records === "undefined") {
                        return reject();
                    }
                    return resolve(_.isNumber(rc_ids) ? records[0] : records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Number/Array[Number]} rc_ids
         * @returns {Promise[Array[Object]]}
         */
        browseBinary: function (model, rc_id) {
            return this.indexeddb.getRecord("binary", false, [model, rc_id]);
        },

        /**
         * @param {Object} model_info
         * @param {Array} domain
         * @returns {Promise}
         */
        count: function (model_info, domain) {
            return this.search(model_info, domain, false, false, false, false, true);
        },

        /**
         * @param {String} xmlid
         * @returns {Promise}
         */
        ref: function (xmlid) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_data = await this.getModelData(xmlid);
                    let record = {};
                    if (model_data.model.startsWith('ir.actions.')) {
                        const model_info = await this.sqlitedb.getModelInfo("actions", true);
                        record = await this.browse(model_info, model_data.res_id);
                    } else {
                        const records = await this.browse(model_data.model, model_data.res_id);
                        if (records.length) {
                            record = records[0];
                        }
                    }

                    if (_.isEmpty(record)) {
                        return reject();
                    }

                    return resolve(record);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model
         * @param {Array} fields
         * @param {String} type
         * @returns {Promise}
         */
        getModelFieldsInfo: function (model_info, fields, type) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    if (!fields) {
                        fields = _.keys(model_info.fields);
                    }
                    const field_infos = {};
                    for (let field of fields) {
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
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    const model_info_sync = await this.sqlitedb.getModelInfo("sync", true);
                    const sync_records = await this.search_read(model_info_sync, [['model', '=', model_info.model], ['method', '=', 'create']]);
                    const record = _.findWhere(sync_records, record => record.args[0].id === rec_id);
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
        genRecordID: function () {
            return 90000000 + new Date().getTime();
        },

        //-------------------
        // HELPERS
        //-------------------

        /**
         * @param {String} xmlid
         * @returns {Promise}
         */
        getModelData: function (xmlid) {
            return new Promise(async (resolve, reject) => {
                const module_name = xmlid.split(".", 1)[0];
                const name = xmlid.substr(module_name.length + 1);
                try {
                    const records = await this.search_read("ir.model.data", [["module", "=", module_name], ["name", "=", name]], 1);
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
        getModelDefaults: function (model_info) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this.sqlitedb.getModelInfo(model_info);
                    }

                    let values = model_info.defaults || {};
                    const model_info_defaults = await this.sqlitedb.getModelInfo("defaults", true);
                    let records = [];
                    try {
                        records = await this.search_read(model_info_defaults, [["model", "=", model]]);
                    } catch (err) {
                        // do nothing
                    }
                    if (_.isEmpty(records)) {
                        return reject();
                    }
                    const sandbox = new JSSandbox();
                    for (const record of records) {
                        if (typeof record.formula !== 'undefined') {
                            sandbox.compile(record.formula);
                            _.extend(values, sandbox.run());
                        }
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
         * @param {Array[Object]} records
         * @param {String} onchange_field
         * @param {Object} record_data
         * @returns {Array[Object]}
         */
        filterOnchangeRecordsByParams: function (records, onchange_field, record_data) {
            const res = [];
            for (const record of records) {
                var params = _.pick(record_data, onchange_field);

                // Construct params using "trigger" fields
                if (record.triggers) {
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
                        for (var index=0; index<levels.length; ++index) {
                            const level = levels[index];
                            if (!temp_arr_value[level]) {
                                temp_arr_value[level] = {};
                            }
                            if (index < levels.length-1) {
                                temp_arr_value = temp_arr_value[level];
                            }
                            value = value[level];
                            last_level = level;
                        }
                        temp_arr_value[last_level] = value;
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
                    if (record_param_value instanceof Array &&
                        record_param_value.length === 3
                    ) {
                        // Check 'params commands'
                        if (record_param_value[0] === 'r' &&
                            (
                                params[field_name] < record_param_value[1] ||
                                params[field_name] > record_param_value[2]
                            )
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
         * @param {Array[int]} oids
         * @returns {Promise[Array[Number]]}
         */
        vacuumRecords: function (model, oids) {
            return new Promise(async (resolve, reject) => {
                try {
                    const records = await this.search_read(model, []);
                    const cur_ids = _.map(records, "id");
                    const ids_to_remove = _.difference(oids, cur_ids);
                    this.unlink(model, ids_to_remove);
                    return resolve(ids_to_remove);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @param {Object} model_info
         * @return {Promise}
         */
        _getFieldNamesByType: function (model_info, field_type) {
            return _.chain(model_info.fields).pick((item) => item.type === field_type).keys().value();
        },
    });

    return DatabaseManager;

});
