/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.db.SQLiteDB", function (require) {
    "use strict";

    const Expression = require("web_pwa_cache.PWA.core.osv.Expression");
    const tools = require("web_pwa_cache.PWA.core.base.Tools");
    const Database = require("web_pwa_cache.PWA.core.db.Database");
    const Model = require("web_pwa_cache.PWA.core.osv.Model");


    const SQLiteDB = Database.extend({
        _sqlite_dist: "./web_pwa_cache/static/src/js/worker/lib/sqlite/dist/",
        _internal_table_prefix: 'i_pwa_',

        // See https://www.sqlite.org/datatype3.html 3.1.1
        _odoo_to_sqlite: {
            'float': 'REAL',
            'monetary': 'REAL',
            'char': 'TEXT',
            'text': 'TEXT',
            'html': 'TEXT',
            'date': 'NUMERIC',
            'datetime': 'NUMERIC',
            'binary': 'BLOB',
            'selection': 'TEXT',
            'reference': 'TEXT',
            'many2one': 'TEXT', // Store with format:  ||id1||||display_name|| to use 'like' ||id||
            'one2many': 'TEXT', // Store with format:  ||id1||||id2||||id3|| to use 'like' ||id||
            'many2many': 'TEXT', // Store with format:  ||id1||||id2||||id3|| to use 'like' ||id||
            'id': 'INTEGER',
            'boolean': 'NUMERIC',

            'json': 'TEXT', // internal type
        },

        regex_order: new RegExp('^(\s*([a-z0-9:_]+|"[a-z0-9:_]+")(\s+(desc|asc))?\s*(,|$))+(?<!,)$', 'i'),

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this._db = undefined;
            this._osv = new Model(this, this.getParent());
        },

        /**
         * @override
         */
        start: function (callback) {
            return new Promise(async (resolve, reject) => {
                if (this._db) {
                    return resolve(this._db);
                }
                try {
                    this._db = await self.sqliteWorker({dist: this._sqlite_dist, name: this._db_name});
                    if (callback) {
                        await callback(this._db);
                    }
                } catch (err) {
                    return reject(err);
                }
                return resolve(this._db);
            });
        },


        decode: function (text) {
            if (!text) {
                return typeof text === "string" ? "" : false;
            }
            return text.replaceAll("%3F", "?");
        },

        /**
         * @returns {SQL-Tag}
         */
        getDB: function () {
            return this._db;
        },

        getInternalTableName: function (table) {
            return `${this._internal_table_prefix}${table}`;
        },

        /**
         * @param {Object} model_info
         * @param {Array} ids
         * @returns {Promise}
         */
        getRecords: function (model_info, rc_ids) {
            return new Promise(async (resolve, reject) => {
                if (!rc_ids.length) {
                    return resolve(rc_ids.length === 1 ? undefined : []);
                }
                let sql = `SELECT * FROM "${model_info.table}"`;
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
                    for (let id of rc_ids) {
                        res.push(_.findWhere(records, {id: id}));
                    }

                    this._parseValues(model_info.fields, res);
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
        createRecord: function (model_info, values) {
            return new Promise (async (resolve, reject) => {
                try {
                    let svalues = _.clone(values);
                    this._formatValues(model_info.fields, svalues);
                    const [sql_columns, sql_values] = await this.getSqlSanitizedValues(model_info, svalues);
                    const sql = `INSERT INTO "${model_info.table}" (${sql_columns}) VALUES (${sql_values})`;
                    await this._db.query([sql]);
                } catch (err) {
                    return reject(err);
                }
                return resolve(true);
            });
        },

        /**
         * @param {Object} model_info
         * @param {String} primary_key
         * @param {Object} values
         * @param {Any} value
         * @returns {Promise}
         */
        updateRecord: function (model_info, rc_ids, values) {
            return new Promise (async (resolve, reject) => {
                try {
                    let svalues = _.clone(values);
                    this._formatValues(model_info.fields, svalues);
                    const [sql_columns, sql_values, set_sql_values] = await this.getSqlSanitizedValues(model_info, svalues);
                    const sql = `UPDATE "${model_info.table}" SET ${set_sql_values.join(",")} WHERE "id" IN (${rc_ids.join(",")})`;
                    await this._db.query([sql]);
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
        createOrUpdateRecord: function (model_info, values, conflicts) {
            return new Promise (async (resolve, reject) => {
                try {
                    let svalues = _.clone(values);
                    this._formatValues(model_info.fields, svalues);
                    const [sql_columns, sql_values, set_sql_values] = await this.getSqlSanitizedValues(model_info, svalues, conflicts);
                    let sql = `INSERT INTO "${model_info.table}" (${sql_columns}) VALUES (${sql_values})`;
                    if (conflicts && conflicts.length) {
                        sql += ` ON CONFLICT(${conflicts.join(',')}) DO UPDATE SET ${set_sql_values.join(",")}`;
                    }
                    await this._db.query([sql]);
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
        getSqlSanitizedValues: function (model_info, values, omit_set_keys) {
            return new Promise(async (resolve, reject) => {
                const columns = _.keys(values);
                let sql_columns = JSON.stringify(_.keys(values));
                // Remove external quotes
                sql_columns = sql_columns.substr(1, sql_columns.length-2);
                const sql_values = _.values(values).join(",");
                const set_sql_values = _.map(_.omit(values, omit_set_keys), (value, key) => `"${key}"=${value}`);
                return resolve([sql_columns, sql_values, set_sql_values]);
            });
        },

        /**
         * Create a table
         *
         * @param {Object} model_info
         * @returns {Promise}
         */
        createTable: function (model_info) {
            let model_fields = model_info.fields;
            if (typeof model_fields === "string") {
                model_fields = JSON.parse(model_info.fields);
            }
            const field_names = _.keys(model_fields);
            const table_fields = ["'id' INTEGER PRIMARY KEY"];
            let sql = `CREATE TABLE IF NOT EXISTS "${model_info.table}" (`;
            for (let field_name of field_names) {
                if (field_name === "id") {
                    continue;
                }
                var field = model_fields[field_name];
                table_fields.push(`"${field_name}" ${this._odoo_to_sqlite[field.type]}`);
            }
            sql += table_fields.join(",");
            sql += ")";
            return this._db.query([sql]);
        },

        /**
         * @param {Object} model_info
         * @param {Array} ids
         * @returns {Promise}
         */
        deleteRecords: function (model_info, ids) {
            let sql = `DELETE FROM "${model_info.table}"`;
            if (ids && ids.length) {
                sql += ` WHERE "id" IN (${ids.join(",")})`;
            }
            return this._db.query([sql]);
        },

        /**********
         * HELPERS
         **********/
        getModelInfoMetada: function () {
            return new Promise(async (resolve, reject) => {
                const model_metadata = this.getInternalTableName('model_metadata');
                try {
                    const record = await this._db.get([`SELECT * FROM "${model_metadata}" WHERE "model"="${model_metadata}"`]);
                    if (_.isEmpty(record)) {
                        return reject("Main model metadata not found!");
                    }
                    this._parseValues(JSON.parse(record.fields), record);
                    return resolve(record);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        getModelInfo: function (models, internal) {
            return new Promise(async (resolve, reject) => {
                try {
                    let sql = `SELECT * FROM "${this.getInternalTableName('model_metadata')}"`;
                    if (models && models instanceof Array && models.length === 0) {
                        return resolve([]);
                    } else if (typeof models === "string") {
                        models = [models];
                    }
                    const model_info_metadata = await this.getModelInfoMetada();
                    if (models) {
                        sql += " WHERE ";
                        const where_sql = [];
                        for (let model of models) {
                            where_sql.push(`"model"="${internal?this.getInternalTableName(model):model}"`);
                        }
                        sql += where_sql.join(" OR ");

                        if (models.length === 1) {
                            const record = await this._db.get([sql]);
                            if (_.isEmpty(record)) {
                                return reject(`Can't found model info for ${models[0]}`);
                            }
                            this._parseValues(model_info_metadata.fields, record);
                            return resolve(record);
                        }
                    }
                    const records = await this._db.all([sql]);
                    if (_.isEmpty(records)) {
                        return reject(`Can't found model info for some or all ${models.join(',')}`);
                    }
                    this._parseValues(model_info_metadata.fields, records);
                    return resolve(records);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        updateModelInfo: function (rc_ids, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_metadata = await this.getModelInfo("model_metadata", true);
                    let record_data = _.clone(data);
                    this._formatValues(model_info_metadata.fields, record_data);
                    record_data = _.omit(record_data, "id");
                    await this.updateRecord(model_info_metadata, rc_ids, record_data);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * PRIVATE MEMBERS
         */
        _formatValues: function (model_fields, values) {
            // When create the record for metadata model, model_info has the field in the correct format
            if (typeof model_fields === "string") {
                model_fields = JSON.parse(model_fields);
            }
            const value_fields = _.keys(values);
            for (let field of value_fields) {
                values[field] = Expression.convert_to_column(model_fields[field], values[field]);
            }
        },

        _parseValues: function (model_fields, datas) {
            if (!(datas instanceof Array)) {
                datas = [datas];
            }
            for (let values of datas) {
                const value_fields = _.keys(values);

                for (let field of value_fields) {
                    if (values[field] === "NULL") {
                        values[field] = false;
                        continue;
                    }

                    switch (model_fields[field].type) {
                        case "date":
                        {
                            values[field] = _.isNumber(values[field]) && tools.DateToOdooFormat(tools.SecondsToDate(values[field]), true);
                        } break;
                        case "datetime":
                        {
                            values[field] = _.isNumber(values[field]) && tools.DateToOdooFormat(tools.SecondsToDate(values[field]));
                        } break;
                        case "boolean":
                        {
                            values[field] = values[field]===1?true:false;
                        } break;
                        case "json":
                        {
                            values[field] = typeof values[field] === "string" && JSON.parse(this.decode(values[field]));
                        } break;
                        case "many2one":
                        {
                            const value = values[field] && _.compact(values[field].split("||"));
                            values[field] = value && [Number(value[0]), value[1]] || false;
                        } break;
                        case "one2many":
                        case "many2many":
                        {
                            values[field] = values[field] && _.chain(values[field].split("||")).compact().map(item => Number(item)).value();
                        } break;
                    }

                    if (typeof values[field] === "string") {
                        values[field] = this.decode(values[field]);
                    } else if (!values[field] && !_.isNumber(values[field])) {
                        // Odoo doesn't accept "undefined" or "null" values. Ensure boolean usage
                        values[field] = false;
                    }
                }
            }
        },
    });

    return SQLiteDB;

});
