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
         * This is necessary because sqlite recognize '?' as an placeholder
         *
         * @param {String} text
         * @returns {String}
         */
        decode: function(text) {
            if (!text) {
                return typeof text === "string" ? "" : false;
            }
            return text;
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
                return JSON.parse(this.decode(values[field]));
            } catch (err) {
                // Do nothing
            }
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
                    this.decode(values[`display_name__${field}`]),
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
            if (!(datas instanceof Array)) {
                datas = [datas];
            }
            // All datas must be of the same query (model and fields)
            const value_fields = _.keys(datas[0]);
            const value_fields_len = value_fields.length;
            const datas_len = datas.length;
            let values = false;
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
                        values[field] = this.decode(values[field]);
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
            json: "TEXT",
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
        install: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    this._db = await self.sqliteWorker({
                        dist: this._sqlite_dist,
                        name: this._db_name,
                        //timeout: 5000,
                    });
                } catch (err) {
                    return reject(err);
                }
                return resolve(this._db);
            });
        },

        /**
         * @override
         */
        start: function(callback) {
            if (callback) {
                return callback(this._db);
            }

            return Promise.resolve();
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
                    sql += ` WHERE "id" IN (${rc_ids.join(",")})`;
                }
                try {
                    const records = await this._db.all([sql]);
                    if (_.isEmpty(records)) {
                        return reject();
                    }
                    // Order by array ids
                    const res = [];
                    for (const id of rc_ids) {
                        res.push(_.findWhere(records, {id: id}));
                    }

                    this.converter.toOdoo(model_info.fields, res);
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
                    let sql = [`INSERT INTO "${model_info.table}" (${sql_columns.join(',')}) VALUES (`];
                    for (let i=sql_values.length - 2; i>=0; --i) {
                        sql.push(",");
                    }
                    sql.push(")");
                    await this._db.query(sql, ...sql_values);
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
                    let sql = [];
                    let sql_sn = `UPDATE "${model_info.table}" SET `;
                    sql_sn += set_sql_keys[0];
                    sql.push(sql_sn);
                    const num_sql_keys = set_sql_keys.length;
                    for (let i=1; i<num_sql_keys; ++i) {
                        sql.push(` ,${set_sql_keys[i]}`);
                    }
                    sql.push(` WHERE "id" IN (${rc_ids.join(",")})`)
                    await this._db.query(sql, ...set_sql_values);
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
                    let sql = [`INSERT INTO "${model_info.table}" (${sql_columns.join(',')}) VALUES (`];
                    for (let i=sql_values.length - 2; i>=0; --i) {
                        sql.push(",");
                    }
                    if (conflicts && conflicts.length) {
                        let sql_sn = `) ON CONFLICT(${conflicts.join(
                            ","
                        )}) DO UPDATE SET `;
                        sql_sn += set_sql_keys[0];
                        sql.push(sql_sn);
                        const num_sql_keys = set_sql_keys.length;
                        for (let i=1; i<num_sql_keys; ++i) {
                            sql.push(` ,${set_sql_keys[i]}`);
                        }
                        await this._db.query(sql, ...sql_values, ...set_sql_values);
                    } else {
                        sql.push(")");
                        await this._db.query(sql, ...sql_values);
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
                    const display_name_value = Expression.column_string_encode(
                        values[key][1] || "",
                        false,
                        false
                    );
                    sql_columns.push(`"${display_name_field}"`);
                    sql_values.push(values[key][0] || null);
                    sql_values.push(display_name_value);
                    if (omit_set_keys.indexOf(key) === -1) {
                        set_sql_values.push(values[key][0] || null);
                        set_sql_values.push(display_name_value);
                        set_sql_keys.push(`"${key}"=`);
                        set_sql_keys.push(
                            `"${display_name_field}"=`
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
                        set_sql_keys.push(`"${key}"=`);
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
            const table_fields = ["'id' INTEGER PRIMARY KEY"];
            let sql = `CREATE TABLE IF NOT EXISTS "${model_info.table}" (`;
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
            sql += table_fields.join(",");
            sql += ")";
            return this._db.query([sql]);
        },

        /**
         * @param {Object} model_info
         * @param {String} index_name
         * @param {Array} index_fields
         * @returns {Promise}
         */
        createIndex: function(model_info, index_name, index_fields, unique = true) {
            return this._db.query([
                `CREATE ${
                    unique ? "UNIQUE" : ""
                } INDEX IF NOT EXISTS ${index_name} ON ${
                    model_info.table
                } (${index_fields.join(",")})`,
            ]);
        },

        /**
         * @param {Object} model_info
         * @param {Array} ids
         * @returns {Promise}
         */
        deleteRecords: function(model_info, ids) {
            let sql = `DELETE FROM "${model_info.table}"`;
            if (ids && ids.length) {
                sql += ` WHERE "id" IN (${ids.join(",")})`;
            }
            return this._db.query([sql]);
        },

        /** ********
         * HELPERS
         **********/
        getModelInfoMetada: function() {
            return new Promise(async (resolve, reject) => {
                const model_metadata = this.getInternalTableName("model_metadata");
                try {
                    const record = await this._db.get([
                        `SELECT * FROM "${model_metadata}" WHERE "table"="${model_metadata}"`,
                    ]);
                    if (_.isEmpty(record)) {
                        return reject("Main model metadata not found!");
                    }
                    this.converter.toOdoo(JSON.parse(record.fields), record);
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
                            const record = await this._db.get([sql]);
                            if (_.isEmpty(record)) {
                                return reject(
                                    `Can't found model info for ${models[0]}`
                                );
                            }
                            this.converter.toOdoo(model_info_metadata.fields, record);
                            return resolve(record);
                        }
                    }
                    const records = await this._db.all([sql]);
                    if (_.isEmpty(records)) {
                        return reject(
                            `Can't found model info for some or all ${models.join(",")}`
                        );
                    }
                    this.converter.toOdoo(model_info_metadata.fields, records);
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
