"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

/**
 * This class is used to get the necessary data to simulate the Odoo replies.
 * The name of the functions match with the name of the python implementation.
 */
const ComponentExporter = SWComponent.extend({
    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise[Array[Object]]}
     */
    name_search: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const [records] = await this._odoodb.search(
                    model,
                    data.kwargs.args,
                    data.kwargs.limit
                );
                const filtered_records = _.map(records, (item) =>
                    _.values(_.pick(item, ["id", "display_name"]))
                );
                return resolve(filtered_records);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise[Array[Object]]}
     */
    name_get: function (model, data) {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            try {
                let record_ids = data.args;
                if (!record_ids || _.isEmpty(record_ids)) {
                    return resolve([]);
                }
                if (typeof record_ids[0] !== "number") {
                    record_ids = record_ids[0];
                }
                const records = await this._odoodb.browse(model, record_ids);
                if (!records.length && !is_offline_mode) {
                    // Only reject if not offline
                    return reject();
                }
                const filtered_records = _.map(records, (item) =>
                    _.values(_.pick(item, ["id", "display_name"]))
                );
                return resolve(filtered_records);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise[Boolean]}
     */
    onchange: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const is_offline_mode = await this.isOfflineMode();
                // If doesn't exists any onchange record for the current model avoid all the process
                const onchange_count = await this._db.countRecords("webclient", "onchange", "model", model);
                if (!onchange_count) {
                    if (is_offline_mode) {
                        return resolve({});
                    }
                    return reject();
                }

                const record_data = data.args[1];
                let fields_changed = data.args[2];
                if (typeof fields_changed === "string") {
                    fields_changed = [fields_changed];
                }
                let onchange_found = false;
                const res = {value: {}};
                for (const field_name of fields_changed) {
                    try {
                        let records = await this._db.getRecords(
                            "webclient", "onchange", "model_field_value", [
                                model,
                                field_name,
                                JSON.stringify(record_data[field_name]),
                            ]);
                        records = this._odoodb.filterOnchangeRecordsByParams(
                            records, field_name, record_data);
                        if (_.isEmpty(records)) {
                            const fields_info = await this._odoodb.getModelFieldsInfo(model, [field_name]);
                            if (
                                fields_info &&
                                "relation" in fields_info[field_name]
                            ) {
                                const isOfflineRecord = await this._odoodb.isOfflineRecord(
                                    fields_info[field_name].relation,
                                    record_data[field_name]
                                );
                                if (isOfflineRecord) {
                                    // If is a offline record fallback to "empty" onchange
                                    onchange_found = true;
                                    res.value[field_name] = record_data[field_name];
                                }
                            }
                            continue;
                        }
                        onchange_found = true;
                        const sandbox = new JSSandbox();
                        for (const record of records) {
                            let value = false;
                            let warning = false;
                            let domain = false;
                            if (typeof record.changes !== 'undefined') {
                                value = record.changes.value;
                                warning = record.changes.warning;
                                domain = record.changes.domain;
                            } else if (typeof record.formula !== 'undefined') {
                                sandbox.compile(record.formula);
                                const changes = sandbox.run(record_data);
                                value = changes.value;
                                warning = changes.warning;
                                domain = changes.domain;
                            }
                            if (value) {
                                res.value = _.extend({}, res.value, value);
                            }
                            if (warning) {
                                res.warning = _.extend({}, res.warning, warning);
                            }
                            if (domain) {
                                res.domain = _.extend({}, res.domain, domain);
                            }
                        }
                    } catch (err) {
                        console.log(`[ServiceWorker] Can't process the given onchange for the fields '${fields_changed.join()}' on the model '${model}'`);
                        console.log(err);
                    }
                }

                if (onchange_found) {
                    return resolve(res);
                }

                if (is_offline_mode) {
                    // In offline mode we return a valid onchange to avoid warnings for every field.
                    // This onchanges must be handle via "pwa.cache" record.
                    return resolve({});
                }
            } catch (err) {
                return reject(err);
            }
            return reject();
        });
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise[Array[Object]]}
     */
    read: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const records = await this._odoodb.browse(data.model, data.args[0]);
                if (records.length === 0) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (is_offline_mode) {
                        return resolve({});
                    }
                    return reject();
                }
                const mapped_records = _.map(records, (item) =>
                    _.pick(item, ["id"].concat(data.args[1]))
                );
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
    read_group: function (model, data) {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
                // In offline mode return an empty read_group to avoid issues
                // FIXME: We can't implement all modifications of this method :/
                const fields = data.kwargs.fields;
                const res = [];
                for (const field of fields) {
                    const values = {
                        id: null,
                        __count: 0,
                    };
                    values[field] = null,
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
    copy: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const is_offline_mode = await this.isOfflineMode();
                if (is_offline_mode) {
                    const record_id = data.args[0];
                    const records = await this._odoodb.browse(model, record_id);
                    records[0].id = this._odoodb.genRecordID();
                    const model_info = await this._odoodb.getModelInfo(model);
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
    read_template: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const record = await this._db.getRecord("webclient", "template", false, data.args[0]);
                if (_.isEmpty(record)) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (is_offline_mode) {
                        return resolve({});
                    }
                    return reject();
                }
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise[Boolean]}
     */
    write: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_info = await this._odoodb.getModelInfo(model);
                await this._process_record_write(model_info, data);
                return resolve(true);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise[Number/String]}
     */
    create: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_info = await this._odoodb.getModelInfo(model);

                // Get context defaults
                const context_defaults = data.kwargs.context;
                const default_keys = _.filter(Object.keys(context_defaults), function (
                    item
                ) {
                    return item.startsWith("default_");
                });
                const defaults = {};
                for (const key of default_keys) {
                    const skey = key.substr(8); // 8 > Omit 'default_'
                    const svalue = context_defaults[key];
                    if (typeof svalue !== "object") {
                        if ("relation" in model_info.fields[skey]) {
                            defaults[skey] = (
                                await this.name_get(model_info.fields[skey].relation, {
                                    args: [[context_defaults[key]]],
                                })
                            )[0];
                        } else {
                            defaults[skey] = context_defaults[key];
                        }
                    } else {
                        defaults[skey] = context_defaults[key];
                    }
                }

                data.args = _.map(data.args, (item) =>
                    _.extend({id: this._odoodb.genRecordID()}, item, defaults)
                );
                const c_ids = await this._process_record_create(
                    model_info,
                    data
                );
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
    unlink: function (model, data) {
        return new Promise(async (resolve) => {
            await this.unlinkRecords(model, data.args[0]);
            await this._db.createRecords("webclient", "sync", [{
                model: model,
                method: "unlink",
                args: [[data.args[0]]],
                date: new Date().getTime(),
            }]);
            return resolve(true);
        });
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise[Object]}
     */
    default_get: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_info = await this._odoodb.getModelInfo(model);
                const model_defaults = this._odoodb.getModelDefaults(model_info.model);
                const is_offline_mode = await this.isOfflineMode();
                if (_.isEmpty(model_defaults) && !is_offline_mode) {
                    return reject();
                }
                const context_defaults = data.kwargs.context;
                const default_keys = _.filter(Object.keys(context_defaults), function (
                    item
                ) {
                    return item.startsWith("default_");
                });
                const defaults = {};
                for (const key of default_keys) {
                    const skey = key.substr(8);
                    defaults[skey] = context_defaults[key];
                }
                const result = _.extend({}, model_defaults, defaults);
                const values = _.pick(result, data.args[0]);
                for (const key in values) {
                    const value = values[key];
                    // We store records with "full name", but 'default_get' works with only id's
                    // TODO: Improve current implementation, now is fast but maybe not accurated.
                    if (value instanceof Array && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "string") {
                        values[key] = value[0];
                    }
                }
                return resolve(values);
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
    get_filters: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const uid = await this.getParent().config.getUID();
                const model = data.args[0];
                const action_id = data.args[1];
                const action_domain = [];
                if (action_id) {
                    action_domain.push(['action_id', 'in', [action_id, false]]);
                }
                const [records] = await this._odoodb.search("ir.filters", _.union(action_domain, [['model_id', '=', model], ['user_id', 'in', [uid, false]]]));
                if (!records.length) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (!is_offline_mode) {
                        return reject();
                    }
                }
                const filters = [];
                for (const record of records) {
                    filters.push(_.pick(record, ['name', 'is_default', 'domain', 'context', 'user_id', 'sort']));
                }
                return resolve(filters);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} model
     * @returns {Promise[Object]}
     */
    load_views: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_info = await this._odoodb.getModelInfo(model);
                const options = data.kwargs.options;
                const views = data.kwargs.views;
                const res = {};
                if (options?.load_filters) {
                    res.filters = await this.get_filters(model, {args: [model, options.action_id]});
                }
                res.fields = model_info.fields;
                res.fields_views = {};
                for (const [view_id, view_type] of views) {
                    const fields_view = await this._db.getRecord("webclient", "views", false, [model, view_id || 0, view_type === "list"?"tree":view_type]);
                    if (fields_view) {
                        res.fields_views[view_type] = fields_view;
                    } else {
                        // If not view found fallback to form view
                        res.fields_views[view_type] = await this._db.getRecord("webclient", "views", false, [model, view_id || 0, "form"]);
                    }

                    if (_.isEmpty(res.fields_views[view_type])) {
                        const is_offline_mode = await this.isOfflineMode();
                        if (!is_offline_mode) {
                            return reject();
                        }
                    }
                }
                if (!options?.toolbar) {
                    const view_types = Object.keys(res.fields_views);
                    for (const view_type of view_types) {
                        res.fields_views[view_type] = _.omit(res.fields_views[view_type], "toolbar");
                    }
                }
                return resolve(res);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @returns {Promise[Object]}
     */
    load_menus: function () {
        return new Promise(async (resolve, reject) => {
            try {
                const record = await this._db.getRecord(
                    "webclient",
                    "userdata",
                    false,
                    "menus"
                );
                if (_.isEmpty(record)) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (!is_offline_mode) {
                        return reject();
                    }
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
    check_access_rights: function () {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
                return resolve(true);
            } else {
                return reject();
            }
        });
    },

    /**
     * Offline mode (all groups)
     *
     * @returns {Promise}
     */
    has_group: function () {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
                return resolve(true);
            } else {
                return reject();
            }
        });
    },

    /**
     * Offline mode (can't know this info)
     *
     * @returns {Promise}
     */
    xmlid_to_res_id: function (model, data) {
        return new Promise(async (resolve, reject) => {
            const xmlid = data.kwargs.xmlid;
            try {
                const record = await this._odoodb.ref(xmlid);
                if (_.isEmpty(record)) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (!is_offline_mode) {
                        return reject();
                    }
                }
                return resolve(record.id);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {Object} data
     * @returns {Promise[Object]}
     */
    action_load: function (data) {
        return new Promise(async (resolve, reject) => {
            try {
                let action_id = data.action_id;
                if (typeof action_id !== "number") {
                    const action = await this._odoodb.ref(action_id);
                    action_id = action.id;
                }
                const record = await this._db.getRecord("webclient", "actions", false, action_id);
                if (_.isEmpty(record)) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (!is_offline_mode) {
                        return reject();
                    }
                }
                return resolve(record);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @returns {Promise[Object]}
     */
    translations: function () {
        return new Promise(async (resolve, reject) => {
            try {
                const record = await this._db.getRecord("webclient", "userdata", false, "translations");
                if (_.isEmpty(record)) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (!is_offline_mode) {
                        return reject();
                    }
                }
                return resolve(record);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {Object} data
     * @returns {Promise[Object]}
     */
    search_read: function (model, data) {
        return new Promise(async (resolve, reject) => {
            let pmodel = data.model;
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
                // Reduce search performance using 'browse' if the domain only contains ids
                if (pdomain.length === 1 && pdomain[0][0] === "id") {
                    records = await this._odoodb.browse(
                        pmodel,
                        pdomain[0][2]
                    );
                    const model_info = await this._odoodb.getModelInfo(model);
                    records = this._odoodb.applyTransform(records, model_info, plimit, poffset, psort);
                } else {
                    [records, records_count] = await this._odoodb.search(
                        pmodel,
                        pdomain,
                        plimit,
                        poffset,
                        psort
                    );
                }
            } catch (err) {
                const is_offline_mode = await this.isOfflineMode();
                // If not offline we need try from odoo server
                if (!is_offline_mode) {
                    return reject(err);
                }
                // If offline we return a empty recordset
                records = [];
            }
            records = _.map(records, (item) => _.pick(item, ["id"].concat(pfields)));
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
    create_or_replace: function () {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
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
    fields_get: function (model, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_info = await this._odoodb.getModelInfo(model);
                if (_.isEmpty(model_info)) {
                    const is_offline_mode = await this.isOfflineMode();
                    if (!is_offline_mode) {
                        return reject();
                    }
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
    get_formview_id: function (model, data) {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
                return resolve(false);
            } else {
                return reject();
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
    get_formview_action: function (model, data) {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
                const record_id = data.args[0][0];
                return resolve({
                    'type': 'ir.actions.act_window',
                    'res_model': model,
                    'view_type': 'form',
                    'view_mode': 'form',
                    'views': [[false, 'form']],
                    'target': 'current',
                    'res_id': record_id,
                });
            } else {
                return reject();
            }
        });
    },

    /**
     * Wkhtml is not supported in offline mode
     *
     * @returns {Promise}
     */
    check_wkhtml_to_pdf: function () {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
                return resolve("broken");
            }
            return reject();
        });
    },

    /**
     * In offline mode can't run action of type
     * ir.actions.server
     */
    action_run: function () {
        return new Promise(async (resolve, reject) => {
            const is_offline_mode = await this.isOfflineMode();
            if (is_offline_mode) {
                return resolve(false);
            }
            return reject();
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
    _generic_post: function (pathname, params) {
        return this._db.getRecord("webclient", "post", false, [
            pathname,
            JSON.stringify(params),
        ]);
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
    _generic_function: function (model, method, params) {
        return this._db.getRecord("webclient", "function", false, [
            model,
            method,
            JSON.stringify(params),
        ]);
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
    web_image: function (model, id, field, search_params) {
        return new Promise(async (resolve, reject) => {
            try {
                let records = [];
                let sfield = field;
                if (_.isEmpty(search_params)) {
                    records = await this._odoodb.browse(model, Number(id));
                } else {
                    records = await this._odoodb.browse(search_params.model, Number(search_params.id));
                    sfield = search_params.field;
                }
                if (_.isEmpty(records)) {
                    return reject();
                }
                return resolve(records[0][sfield]);
            } catch (err) {
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
    _process_record_create: function (model_info, data) {
        return new Promise(async (resolve) => {
            const records_sync = [];
            for (let index in data.args) {
                const model_defaults = this._odoodb.getModelDefaults(model_info.model);
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
                    if (!record[field]) {
                        continue;
                    }
                    const field_def = model_info.fields[field];
                    if (field_def.type === "one2many") {
                        const relation = field_def.relation;
                        const field_model_info = await this._odoodb.getModelInfo(relation);
                        if (!records_linked[relation]) {
                            records_linked[relation] = [];
                        }
                        const ids_to_add = [];
                        const subrecords = [];
                        for (const command of record[field]) {
                            // create only have 0 command
                            if (command[0] === 0) {
                                let subrecord = command[2];
                                const subrecord_fields = Object.keys(subrecord);
                                const parent_field = _.findKey(field_model_info.fields, {
                                    required: true,
                                    relation: model_info.model,
                                });
                                const model_defaults = this._odoodb.getModelDefaults(model_info.model);
                                subrecord = _.extend(
                                    {},
                                    model_defaults,
                                    subrecord
                                );
                                record.display_name = record.name;
                                subrecord[parent_field] = record.id;
                                subrecord.id = this._odoodb.genRecordID();
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
                            await this._odoodb.writeOrCreate(relation, subrecords, true);
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
                records_sync.splice(0, 0, {
                    model: model_info.model,
                    method: "create",
                    args: [_.omit(record, processed_fields)],
                    date: new Date().getTime(),
                    linked: records_linked,
                    kwargs: data.kwargs,
                });
                await this._db.createRecords("webclient", "sync", records_sync);
            }

            await this._odoodb.writeOrCreate(model_info.model, data.args, true);
            return resolve(_.map(data.args, "id"));
        });
    },

    /**
     * Resolve Many2one
     *
     * @private
     * @param {String} model
     * @param {Object} data
     */
    _process_record_write: function (model_info, data) {
        return new Promise(async (resolve) => {
            const records_sync = [];
            const modified_records = data.args[0];
            const modifications = data.args[1];
            const modified_fields = Object.keys(modifications);
            const processed_modifs = await this._process_record_to_merge(
                modifications,
                model_info.fields,
                false
            );
            const records = await this._odoodb.browse(model_info.model, modified_records);
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
                        const field_model_info = await this._odoodb.getModelInfo(
                            relation
                        );
                        const subrecords = [];
                        for (const command of modifications[field]) {
                            if (command[0] === 0) {
                                let subrecord = command[2];
                                const parent_field = _.findKey(field_model_info.fields, {
                                    required: true,
                                    relation: model_info.model,
                                });
                                const model_defaults = this._odoodb.getModelDefaults(field_model_info.model);
                                subrecord = _.extend(
                                    {},
                                    model_defaults,
                                    subrecord
                                );
                                subrecord[parent_field] = record.id;
                                subrecord.id = this._odoodb.genRecordID();
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
                                const ref_records = await this._odoodb.browse(
                                    relation,
                                    command[1]
                                );
                                let ref_record = {};
                                if (!_.isEmpty(ref_records)) {
                                    ref_record = ref_records[0];
                                }
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
                                    this._odoodb.unlink(relation, [command[1]]);
                                }
                                record[field] = _.reject(
                                    record[field],
                                    (item) => item === command[1]
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
                                    view_def.fields
                                );
                                record[field] = idb_value;
                                data_to_sync[field] = command[2];
                            }
                        }
                        if (subrecords.length) {
                            await this._odoodb.writeOrCreate(relation, subrecords, true);
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
                await this._db.createRecords("webclient", "sync", records_sync);
                await this._odoodb.write(model_info.model, [record.id], record);
            }
            return resolve(true);
        });
    },

    /**
     * @private
     * @param {Object} record
     * @param {Array[String]} fields
     * @returns {Promise}
     */
    _process_record_to_merge: function (record, fields, to_create) {
        return new Promise(async (resolve, reject) => {
            const processed_record = _.clone(record);
            if (Object.keys(fields).length) {
                const model_fields = Object.keys(fields);
                const processed_fields = [];
                for (const field of model_fields) {
                    if (field in record) {
                        if (fields[field].type === "many2one" && typeof record[field] === "number") {
                            try {
                                const ref_records = await this._odoodb.browse(
                                    fields[field].relation,
                                    Number(record[field])
                                );
                                if (!_.isEmpty(ref_records)) {
                                    const ref_record = ref_records[0];
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
                    } else if (to_create && !this._odoodb.isInternalField(field)) {
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
