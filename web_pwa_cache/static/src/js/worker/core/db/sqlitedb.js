/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.db.SQLiteDB", function(require) {
    "use strict";

    const OdooClass = require("web.Class");
    const Expression = require("web_pwa_cache.PWA.core.osv.Expression");
    const tools = require("web_pwa_cache.PWA.core.base.Tools");
    const Database = require("web_pwa_cache.PWA.core.db.Database");
    const Model = require("web_pwa_cache.PWA.core.osv.Model");

    const SQLiteConverter = OdooClass.extend({
        _type_parse_methods: {
            date: "parseDate",
            datetime: "parseDatetime",
            boolean: "parseBoolean",
            binary: "parseJson",
            json: "parseJson",
            many2one: "parseMany2one",
            one2many: "parseOne2many",
            many2many: "parseOne2many",
        },

        /**
         * This is necessary because sqlite doesn't have a type for date
         *
         * @param {Object} values
         * @param {String} field
         * @returns {String}
         */
        parseDate: function(values, field) {
            if (!values[field]) { return false; }
            return tools.DateToOdooFormat(tools.SecondsToDate(values[field]), true);
        },

        /**
         * This is necessary because sqlite doesn't have a type for datetime
         *
         * @param {Object} values
         * @param {String} field
         * @returns {String}
         */
        parseDatetime: function(values, field) {
            if (!values[field]) { return false; }
            return tools.DateToOdooFormat(tools.SecondsToDate(values[field]));
        },

        /**
         * This is necessary because sqlite doesn't have a type for boolean
         *
         * @param {Object} values
         * @param {String} field
         * @returns {Boolean}
         */
        parseBoolean: function(values, field) {
            return values[field] === 1;
        },

        /**
         * This is necessary because sqlite doesn't have a type for json
         *
         * @param {Object} values
         * @param {String} field
         * @returns {Object}
         */
        parseJson: function(values, field) {
            try {
                //return JSON.parse(LZString.decompressFromUint8Array(values[field]));
                return JSON.parse(values[field]);
            } catch (err) {
                // Do nothing
            }
            //return LZString.decompressFromUint8Array(values[field]);
            return values[field];
        },

        /**
         * This is necessary because pwa uses client side x2x format
         *
         * @param {Object} values
         * @param {String} field
         * @returns {Array}
         */
        parseMany2one: function(values, field) {
            return (
                (values[field] && [
                    Number(values[field]),
                    values[`display_name__${field}`],
                ]) ||
                false
            );
        },

        /**
         * This is necessary because pwa uses client side x2x format
         *
         * @param {Object} values
         * @param {String} field
         * @returns {Array}
         */
        parseOne2many: function(values, field) {
            const ids = _.chain(values[field].split("||"))
                .compact()
                .map(item => Number(item))
                .value();
            if (_.isEmpty(ids)) {
                return false;
            }
            return ids;
        },

        /**
         * This method removes virtual fields like "display_name__<many2one>"
         *
         * @param {Object} model_fields
         * @param {Array} datas
         * @returns {Array}
         */
        removeNoFields: function(model_fields, datas) {
            const results = [];
            // All datas must be of the same query (model and fields)
            const value_fields = _.keys(datas[0]);
            const value_fields_len = value_fields.length;
            const datas_len = datas.length;
            let values = false;
            for (let index = datas_len - 1; index >= 0; --index) {
                values = datas[index];
                let field = false;
                let field_info = false;
                const result_vals = {};
                for (
                    let index_field = value_fields_len - 1;
                    index_field >= 0;
                    --index_field
                ) {
                    field = value_fields[index_field];
                    field_info = model_fields[field];
                    if (field_info) {
                        result_vals[field] = values[field];
                    }
                }
                results.push(result_vals);
            }
            return results;
        },

        /**
         * This method operate directly over 'datas' array
         *
         * @param {Array} model_fields
         * @param {Array} datas
         */
        toOdoo: function(model_fields, datas) {
            debugger;
            if (!(datas instanceof Array)) {
                datas = [datas];
            }
            // All datas must be of the same query (model and fields)
            const value_fields = _.keys(datas[0]);
            const value_fields_len = value_fields.length;
            const datas_len = datas.length;
            let values = false;
            console.log("----- NUM RECs: ", datas_len, value_fields_len, datas_len * value_fields_len);
            for (let index = datas_len - 1; index >= 0; --index) {
                values = datas[index];
                let field = false;
                let field_info = false;
                for (
                    let index_field = value_fields_len - 1;
                    index_field >= 0;
                    --index_field
                ) {
                    field = value_fields[index_field];
                    if (values[field] !== 0 && !values[field]) {
                        // Odoo doesn't accept "undefined" or "null" values. Ensure boolean usage
                        values[field] = false;
                        continue;
                    }
                    let value_parsed = false;
                    field_info = model_fields[field];
                    if (field_info) {
                        const parse_method = this._type_parse_methods[field_info.type];
                        if (parse_method) {
                            values[field] = this[parse_method](values, field);
                            value_parsed = true;
                        }
                    }
                    if (!value_parsed && typeof values[field] === "string") {
                        // Fields like 'display_name__' are 'virtual' fields without specific definition
                        values[field] = values[field];
                    }
                }
            }
        },
    });

    const SQLiteDB = Database.extend({
        _sqlite_dist: "./web_pwa_cache/static/src/lib/sqlite/dist",
        _internal_table_prefix: "i_pwa_",

        // See https://www.sqlite.org/datatype3.html 3.1.1
        _odoo_to_sqlite: {
            float: "REAL",
            monetary: "REAL",
            char: "TEXT",
            text: "TEXT",
            html: "TEXT",
            date: "NUMERIC",
            datetime: "NUMERIC",
            binary: "BLOB",
            selection: "TEXT",
            reference: "TEXT",
            // Store ID of many2one records and generate a virtual column for the display_name
            many2one: "NUMERIC",
            // Store with format:  ||id1||||id2||||id3|| to use 'like' ||id||
            one2many: "TEXT",
            // Store with format:  ||id1||||id2||||id3|| to use 'like' ||id||
            many2many: "TEXT",
            id: "INTEGER",
            boolean: "NUMERIC",

            // Internal type
            json: "BLOB",
        },

        regex_order: new RegExp(
            '^(s*([a-z0-9:_]+|"[a-z0-9:_]+")(s+(desc|asc))?s*(,|$))+(?<!,)$',
            "i"
        ),

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this._db = undefined;
            this._osv = new Model(this, this.getParent());
            this.converter = new SQLiteConverter();
        },

        /**
         * @override
         */
        start: function(callback, sqlitefile_data) {
            return new Promise(async (resolve, reject) => {
                if (!this._sql) {
                    try {
                        this._sql = await self.initSqlJs({
                            locateFile: filename => `${this._sqlite_dist}/${filename}`,
                        });
                        this._db = new this._sql.Database(sqlitefile_data);
                        await this.query("PRAGMA cache_size = -1024"); // negative values =  N * 1024 bytes
                    } catch (err) {
                        return reject(err);
                    }
                }

                return resolve(callback ? callback(this._db) : this._db);
            });
        },

        /**
         * @returns {SQL-Tag}
         */
        getDB: function() {
            return this._db;
        },

        getInternalTableName: function(table) {
            return `${this._internal_table_prefix}${table}`;
        },

        /**
         *
         * @param {String} sql
         * @param {Array} params
         * @returns {Promise}
         */
        query: function(sql, ...params) {
            return new Promise((resolve, reject) => {
                try {
                    const res = this._db.run(sql, _.isEmpty(params) ? false : params);
                    if (!res) {
                        reject(`Invalid Query: ${sql}`);
                        return;
                    }
                    resolve(res);
                } catch (err) {
                    reject(err);
                }
            });
        },

        /**
         *
         * @param {Strings} sql
         * @param {Array} params
         * @returns {Promise}
         */
        all: function(sql, ...params) {
            return new Promise((resolve, reject) => {
                try {
                    const res = this._db.exec(sql, _.isEmpty(params) ? false : params);
                    if (!res) {
                        // Invalid Query
                        reject(`SQL query error: ${sql}`);
                        return;
                    } else if (_.isEmpty(res)) {
                        // Empty Query
                        resolve([]);
                        return;
                    }
                    const values = res[0].values;
                    const columns = res[0].columns;
                    const num_values = values.length;
                    const num_columns = columns.length;
                    const records = [];
                    for (let i=0; i<num_values; ++i) {
                        const rec_vals = {};
                        for (let e=0; e<num_columns; ++e) {
                            rec_vals[columns[e]] = values[i][e];
                        }
                        records.push(rec_vals);
                    }
                    resolve(records);
                } catch (err) {
                    reject(err);
                }
            });
        },

        /**
         *
         * @param {String} sql
         * @param {Array} params
         * @returns {Promise}
         */
        get: function(sql, ...params) {
            return new Promise(async (resolve, reject) => {
                try {
                    const records = await this.all(`${sql} LIMIT 1`, ...params);
                    if (_.isEmpty(records)) {
                        resolve({});
                        return;
                    }
                    return resolve(records[0]);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * To know: sqlite.js works in MEMFS. Don't use in-memory databases.
         */
        setPragmas: function () {
            // The journal_mode pragma gets or sets the journal mode which controls how the journal file is stored and processed.
            // this.query("PRAGMA journal_mode = OFF");
            // The synchronous pragma gets or sets the current disk synchronization mode, which controls how aggressively SQLite will write data all the way out to physical storage.
            // this.query("PRAGMA synchronous = OFF");
            // Query or set the page size of the database. The page size must be a power of two between 512 and 65536 inclusive. (Default is 4096)
            // this.query("PRAGMA page_size = 1024");
            // Query or change the maximum number of bytes that are set aside for memory-mapped I/O on a single database.
            // this.query("PRAGMA mmap_size = 0");
            return true;
        },

        /**
         * @param {Object} model_info
         * @param {Array} rc_ids
         * @returns {Promise}
         */
        getRecords: function(model_info, rc_ids, fields) {
            return new Promise(async (resolve, reject) => {
                if (!rc_ids.length) {
                    return resolve(rc_ids.length === 1 ? undefined : []);
                }
                let sql = `SELECT ${(fields && fields.join(",")) || "*"} FROM "${
                    model_info.table
                }"`;
                if (rc_ids && rc_ids.length) {
                    sql += ` WHERE "id" IN (${new Array(rc_ids.length).fill("?").join(",")})`;
                }
                try {
                    const records = await this.all(sql, ...(rc_ids || []));
                    if (_.isEmpty(records)) {
                        return reject();
                    }
                    // Order by array ids
                    // const res = [];
                    // for (const id of rc_ids) {
                    //     res.push(_.findWhere(records, {id: id}));
                    // }

                    this.converter.toOdoo(model_info.fields, records);
                    return resolve(records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object} model_info
         * @param {Object} values
         * @returns {Promise}
         */
        createRecord: function(model_info, values) {
            return new Promise(async (resolve, reject) => {
                try {
                    let svalues = _.clone(values);
                    if (_.isEmpty(model_info.valid_fields)) {
                        svalues = _.omit(svalues, "guardedcatch");
                    } else {
                        svalues = _.pick(svalues, model_info.valid_fields);
                    }
                    const [sql_columns, sql_values] = await this.getSqlSanitizedValues(
                        model_info,
                        svalues
                    );
                    let sql = `INSERT INTO "${model_info.table}" (${sql_columns.join(',')}) VALUES (${new Array(sql_values.length).fill("?").join(",")})`;
                    await this.query(sql, ...sql_values);
                } catch (err) {
                    return reject(err);
                }
                return resolve(true);
            });
        },

        /**
         * @param {Object} model_info
         * @param {String} rc_ids
         * @param {Object} values
         * @returns {Promise}
         */
        updateRecord: function(model_info, rc_ids, values) {
            return new Promise(async (resolve, reject) => {
                try {
                    let svalues = _.clone(values);
                    if (_.isEmpty(model_info.valid_fields)) {
                        svalues = _.omit(svalues, "guardedcatch");
                    } else {
                        svalues = _.pick(svalues, model_info.valid_fields);
                    }
                    const [, , set_sql_keys, set_sql_values] = await this.getSqlSanitizedValues(
                        model_info,
                        svalues
                    );
                    let sql = `UPDATE "${model_info.table}" SET ${set_sql_keys.join(",")} WHERE "id" IN (${new Array(rc_ids.length).fill("?").join(",")})`;
                    await this.query(sql, ...set_sql_values, ...rc_ids);
                } catch (err) {
                    return reject(err);
                }
                return resolve(true);
            });
        },

        /**
         * @param {Object} model_info
         * @param {Object} values
         * @param {Array} conflicts
         * @returns {Promise}
         */
        createOrUpdateRecord: function(model_info, values, conflicts) {
            return new Promise(async (resolve, reject) => {
                try {
                    let svalues = _.clone(values);
                    if (_.isEmpty(model_info.valid_fields)) {
                        svalues = _.omit(svalues, "guardedcatch");
                    } else {
                        svalues = _.pick(svalues, model_info.valid_fields);
                    }
                    const [
                        sql_columns,
                        sql_values,
                        set_sql_keys,
                        set_sql_values
                    ] = await this.getSqlSanitizedValues(
                        model_info,
                        svalues,
                        conflicts
                    );
                    let sql = `INSERT INTO "${model_info.table}" (${sql_columns.join(',')}) VALUES (${new Array(sql_values.length).fill("?").join(",")})`;
                    if (conflicts && conflicts.length) {
                        sql += ` ON CONFLICT(${conflicts.join(
                            ","
                        )}) DO UPDATE SET ${set_sql_keys.join(",")}`;
                        await this.query(sql, ...sql_values, ...set_sql_values);
                    } else {
                        sql.push(")");
                        await this.query(sql, ...sql_values);
                    }
                } catch (err) {
                    return reject(err);
                }
                return resolve(true);
            });
        },

        /**
         * Get sql strings
         *
         * @param {Object} model_info
         * @param {Object} values
         * @param {Array} omit_set_keys
         * @returns {Array}
         */
        getSqlSanitizedValues: function(model_info, values, omit_set_keys) {
            omit_set_keys =
                omit_set_keys instanceof Array ? omit_set_keys : [omit_set_keys];
            const sql_columns = [];
            const sql_values = [];
            const set_sql_keys = [];
            const set_sql_values = []
            for (const key in values) {
                const field = model_info.fields[key];
                if (!field) {
                    // Because "display_name__" is a virtual record without field definition
                    continue;
                }
                sql_columns.push(`"${key}"`);
                if (field.type === "many2one") {
                    const display_name_field = `display_name__${key}`;
                    const display_name_value = values[key][1] || "";
                    sql_columns.push(`"${display_name_field}"`);
                    sql_values.push(values[key][0] || null);
                    sql_values.push(display_name_value);
                    if (omit_set_keys.indexOf(key) === -1) {
                        set_sql_values.push(values[key][0] || null);
                        set_sql_values.push(display_name_value);
                        set_sql_keys.push(`"${key}"=?`);
                        set_sql_keys.push(
                            `"${display_name_field}"=?`
                        );
                    }
                } else {
                    const sql_value = Expression.convert_to_column(
                        model_info.fields[key],
                        values[key],
                        false,
                        false
                    );
                    sql_values.push(sql_value);
                    if (omit_set_keys.indexOf(key) === -1) {
                        set_sql_values.push(sql_value);
                        set_sql_keys.push(`"${key}"=?`);
                    }
                }
            }
            return [sql_columns, sql_values, set_sql_keys, set_sql_values];
        },

        /**
         * Create a table
         *
         * @param {Object} model_info
         * @returns {Promise}
         */
        createTable: function(model_info) {
            let model_fields = model_info.fields;
            if (typeof model_fields === "string") {
                model_fields = JSON.toOdoo(model_info.fields);
            }
            const field_names = _.keys(model_fields);
            // For sqlite this is an alias for "rowid"
            // See: https://www.sqlite.org/lang_createtable.html#rowid
            const table_fields = ["'id' INTEGER PRIMARY KEY"];
            for (const field_name of field_names) {
                if (field_name === "id" || (!_.isEmpty(model_info.valid_fields) && model_info.valid_fields.indexOf(field_name) === -1)) {
                    continue;
                }
                var field = model_fields[field_name];
                if (field.type === "many2one") {
                    table_fields.push(
                        `"${field_name}" ${
                            this._odoo_to_sqlite[field.type]
                        } REFERENCES ${field.relation.replace(/\./g, "_")}(id)`
                    );
                    table_fields.push(`"display_name__${field_name}" TEXT`);
                } else {
                    table_fields.push(
                        `"${field_name}" ${this._odoo_to_sqlite[field.type]}`
                    );
                }
            }
            let sql = `CREATE TABLE IF NOT EXISTS "${model_info.table}" (${table_fields.join(",")})`;
            return this.query(sql);
        },

        /**
         * @param {Object} model_info
         * @param {String} index_name
         * @param {Array} index_fields
         * @returns {Promise}
         */
        createIndex: function(model_info, index_name, index_fields, unique = true) {
            return this.query(
                `CREATE ${
                    unique ? "UNIQUE" : ""
                } INDEX IF NOT EXISTS ${index_name} ON ${
                    model_info.table
                } (${index_fields.join(",")})`,
            );
        },

        /**
         * @param {Object} model_info
         * @param {Array} ids
         * @returns {Promise}
         */
        deleteRecords: function(model_info, ids) {
            let sql = `DELETE FROM "${model_info.table}"`;
            if (ids && ids.length) {
                sql += ` WHERE "id" IN (${new Array(ids.length).fill("?").join(",")})`;
            }
            return this.query(sql, ...(ids || []));
        },

        vacuum: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    await this.query("PRAGMA shrink_memory");
                    await this.query("VACUUM");
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /** ********
         * HELPERS
         **********/
        getModelInfoMetada: function() {
            return new Promise(async (resolve, reject) => {
                const model_metadata = this.getInternalTableName("model_metadata");
                try {
                    const record = await this.get(
                        `SELECT * FROM "${model_metadata}" WHERE "table"=?`,
                        model_metadata
                    );
                    if (_.isEmpty(record)) {
                        return reject("Main model metadata not found!");
                    }
                    this.converter.toOdoo(this.converter.parseJson(record, "fields"), record);
                    return resolve(record);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        getModelInfo: function(models, internal, grouped) {
            return new Promise(async (resolve, reject) => {
                try {
                    let sql = `SELECT * FROM "${this.getInternalTableName(
                        "model_metadata"
                    )}"`;
                    if (models && models instanceof Array && models.length === 0) {
                        return resolve([]);
                    } else if (typeof models === "string") {
                        models = [models];
                    }
                    const model_info_metadata = await this.getModelInfoMetada();
                    if (models) {
                        sql += " WHERE ";
                        const where_sql = [];
                        for (const model of models) {
                            where_sql.push(
                                `"model"="${
                                    internal ? this.getInternalTableName(model) : model
                                }"`
                            );
                        }
                        sql += where_sql.join(" OR ");

                        if (models.length === 1) {
                            console.time("model_info_get");
                            const record = await this.get(sql);
                            console.timeEnd("model_info_get");
                            if (_.isEmpty(record)) {
                                return reject(
                                    `Can't found model info for ${models[0]}`
                                );
                            }
                            console.time("model_info_converter_get");
                            this.converter.toOdoo(model_info_metadata.fields, record);
                            console.timeEnd("model_info_converter_get");
                            return resolve(record);
                        }
                    }
                    console.time("model_info_all");
                    const records = await this.all(sql);
                    console.timeEnd("model_info_all");
                    if (_.isEmpty(records)) {
                        return reject(
                            `Can't found model info for some or all ${models.join(",")}`
                        );
                    }
                    console.time("model_info_converter_all");
                    this.converter.toOdoo(model_info_metadata.fields, records);
                    console.timeEnd("model_info_converter_all");
                    if (grouped) {
                        const mapped_records = {};
                        for (const record of records) {
                            mapped_records[record.model] = record;
                        }
                        return resolve(mapped_records);
                    }
                    return resolve(records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        updateModelInfo: function(rc_ids, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_metadata = await this.getModelInfo(
                        "model_metadata",
                        true
                    );
                    let record_data = _.clone(data);
                    // This._formatValues(model_info_metadata.fields, record_data);
                    record_data = _.omit(record_data, "id");
                    await this.updateRecord(model_info_metadata, rc_ids, record_data);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },
    });

    return {
        SQLiteDB: SQLiteDB,
        SQLiteConverter: SQLiteConverter,
    };
});
