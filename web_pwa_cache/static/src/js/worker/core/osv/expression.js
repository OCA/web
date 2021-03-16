// Part of Odoo. See LICENSE file for full copyright and licensing details.
// Port to javascript and adapted to sqlite client side by Tecnativa - Alexandre D. Díaz

odoo.define("web_pwa_cache.PWA.core.osv.Expression", function (require) {
    "use strict";

    const tools = require("web_pwa_cache.PWA.core.base.Tools");
    const OdooClass = require("web.Class");

    const IN_MAX = 1000;
    //Domain operators.
    const NOT_OPERATOR = '!';
    const OR_OPERATOR = '|';
    const AND_OPERATOR = '&';
    const DOMAIN_OPERATORS = [NOT_OPERATOR, OR_OPERATOR, AND_OPERATOR];

    const TERM_OPERATORS = ['=', '!=', '<=', '<', '>', '>=', '=?', '=like', '=ilike',
                    'like', 'not like', 'ilike', 'not ilike', 'in', 'not in',
                    'child_of', 'parent_of'];

    const NEGATIVE_TERM_OPERATORS = ['!=', 'not like', 'not ilike', 'not in'];

    // Negation of domain expressions
    const DOMAIN_OPERATORS_NEGATION = {
        [AND_OPERATOR]: OR_OPERATOR,
        [OR_OPERATOR]: AND_OPERATOR,
    };
    const TERM_OPERATORS_NEGATION = {
        '<': '>=',
        '>': '<=',
        '<=': '>',
        '>=': '<',
        '=': '!=',
        '!=': '=',
        'in': 'not in',
        'like': 'not like',
        'ilike': 'not ilike',
        'not in': 'in',
        'not like': 'like',
        'not ilike': 'ilike',
    };

    const TRUE_LEAF = [1, '=', 1];
    const FALSE_LEAF = [0, '=', 1];

    const TRUE_DOMAIN = [TRUE_LEAF];
    const FALSE_DOMAIN = [FALSE_LEAF];

    const RELATIONAL_COLUMN_TYPES = ["many2one", "one2many", "many2many"];

    function get_records_ids(records) {
        return records.map((x) => x.id);
    }

    function column_string_encode(text) {
        return text.replaceAll("?", "%3F");
    }

    function convert_to_column(field, value, string_quoted=true) {
        if (field.type === "boolean") {
            return value?1:0;
        }
        else if (field.type === "integer") {
            return Number(value);
        }
        else if (field.type === "float") {
            return Number(value);
        }
        else if (field.type === "date") {
            if (typeof value === "string") {
                return tools.OdooDateToMoment(value, true).valueOf();
            } else if (value instanceof moment) {
                return value.valueOf();
            }
            return value?value:"NULL";
        }
        else if (field.type === "datetime") {
            if (typeof value === "string") {
                return tools.OdooDateToMoment(value).valueOf();
            } else if (value instanceof moment) {
                return value.valueOf();
            }
            return value?value:"NULL";
        }
        else if (field.type === "json") {
            let svalue = '';
            if (typeof value === "string") {
                svalue = column_string_encode(JSON.stringify(value).replaceAll("\"","\"\""));
            } else if (typeof value === "object") {
                svalue = column_string_encode(JSON.stringify(value).replaceAll("\"","\"\""));
            } else if (typeof value === "boolean") {
                svalue = value?1:0;
            } else {
                svalue = JSON.stringify(value);
            }
            return string_quoted?`"${svalue}"`:svalue;
        }
        else if (value && (field.type === "char" || field.type === "text")) {
            const svalue = column_string_encode(String(value).replaceAll("\"","\"\""));
            return string_quoted?`"${svalue}"`:svalue;
        }
        else if (field.type === "html") {
            if (!value) {
                return "NULL";
            }
            const svalue = column_string_encode(value.replaceAll("\"","\"\""));
            return string_quoted?`"${svalue}"`:svalue;
        }
        else if (field.type === "many2one") {
            let svalue = "";
            if (!_.isEmpty(value)) {
                svalue = `||${value[0]}||||${value[1]}||`;
            }
            return string_quoted?`"${svalue}"`:svalue;
        }
        else if (field.type === "one2many" || field.type === "many2many") {
            let svalue = "";
            for (let id of value) {
                svalue += `||${id}||`;
            }
            return string_quoted?`"${svalue}"`:svalue;
        }
        else {
            if (typeof value === "string") {
                return string_quoted?`"${value}"`:value;
            }
            return value || "NULL";
        }
    }

    function normalize_domain(domain) {
        if (_.isEmpty(domain)) {
            return [TRUE_LEAF];
        }
        const result = [];
        let expected = 1;
        const op_arity = {
            [NOT_OPERATOR]: 1,
            [AND_OPERATOR]: 2,
            [OR_OPERATOR]: 2,
        };

        for (let token of domain) {
            if (expected === 0) {
                result.splice(0, 0, AND_OPERATOR);
                expected = 1;
            }
            if (token instanceof Array) {
                expected -= 1;
            }
            else {
                expected += (token in op_arity ? op_arity[token] : 0) - 1;
            }
            result.push(token);
        }
        return result;
    }


    function is_false(model, domain) {
        const stack = [];
        const sdomain = normalize_domain(domain).reverse();
        for (let token of sdomain) {
            if (token == '&') {
                stack.push(Math.min(stack.pop(), stack.pop()));
            } else if (token == '|') {
                stack.push(Math.max(stack.pop(), stack.pop()));
            } else if (token == '!') {
                stack.push(-stack.pop());
            } else if (token == TRUE_LEAF) {
                stack.push(1);
            } else if (token == FALSE_LEAF) {
                stack.push(-1);
            } else if (token[1] == 'in' && !token[2]) {
                stack.push(-1);
            } else if (token[1] == 'not in' && !token[2]) {
                stack.push(1);
            } else {
                stack.push(0);
            }
        }
        return stack.pop() == -1;
    }


    function combine(operator, unit, zero, domains) {
        const result = []
        let count = 0
        if (_.isEqual(domains, [unit])) {
            return unit;
        }
        for (let domain of domains) {
            if (_.isEqual(domain, unit)) {
                continue;
            }
            if (_.isEqual(domain, zero)) {
                return zero;
            }
            if (domain) {
                result += normalize_domain(domain);
                count += 1;
            }
        }
        result = new Array(count-1).fill(operator).concat(result);
        if (_.isEmpty(result)) {
            return unit;
        }
        return result;
    }


    function AND(domains) {
        return combine(AND_OPERATOR, [TRUE_LEAF], [FALSE_LEAF], domains);
    }

    /**
     * OR([D1,D2,...]) returns a domain representing D1 or D2 or ...
     */
    function OR(domains) {
        return combine(OR_OPERATOR, [FALSE_LEAF], [TRUE_LEAF], domains);
    }


    function distribute_not(domain) {
        const result = [];
        const stack = [false];

        for (let token of domain) {
            let negate = stack.pop();
            if (is_leaf(token)) {
                if (negate) {
                    const [left, operator, right] = token;
                    if (operator in TERM_OPERATORS_NEGATION) {
                        result.push((left, TERM_OPERATORS_NEGATION[operator], right));
                    } else {
                        result.push(NOT_OPERATOR);
                        result.push(token);
                    }
                } else {
                    result.push(token);
                }
            } else if (token === NOT_OPERATOR) {
                stack.push(!negate);
            } else if (token in DOMAIN_OPERATORS_NEGATION) {
                result.push(negate ? DOMAIN_OPERATORS_NEGATION[token] : token);
                stack.push(negate);
                stack.push(negate);
            } else {
                result.push(token);
            }
        }

        return result;
    }


    // --------------------------------------------------
    // Generic leaf manipulation
    // --------------------------------------------------

    function generate_table_alias(src_table_alias, joined_tables=[]) {
        let alias = src_table_alias;
        if (_.isEmpty(joined_tables)) {
            return [alias, tools.s_quote(alias)];
        }
        for (let link of joined_tables) {
            alias += '__' + link[1];
        }
        // Use an alternate alias scheme if length exceeds the PostgreSQL limit
        // of 63 characters.
        if (alias.length >= 64) {
            const encoder = new TextEncoder(); // utf-8 by default
            // We have to fit a crc32 hash and one underscore
            // into a 63 character alias. The remaining space we can use to add
            // a human readable prefix.
            const alias_hash = hex(crc32(encoder.encode(alias)))
            ALIAS_PREFIX_LENGTH = 63 - alias_hash.length - 1;
            alias = `${alias.substr(0, ALIAS_PREFIX_LENGTH)}_${alias_hash}`;
        }

        return [alias, `${tools.s_quote(joined_tables[joined_tables.length-1][0])} as ${tools.s_quote(alias)}`];
    }


    function get_alias_from_query(from_query) {
        const from_splitted = from_query.split(' as ')
        if (from_splitted.length > 1) {
            return [from_splitted[0].replaceAll('"', ''), from_splitted[1].replaceAll('"', '')];
        }
        return [from_splitted[0].replaceAll('"', ''), from_splitted[0].replaceAll('"', '')];
    }

    /**
     * Change a term's operator to some canonical form, simplifying later processing.
     */
    function normalize_leaf(element) {
        if (!is_leaf(element)) {
            return element;
        }
        let [left, operator, right] = element;
        const original = operator
        operator = operator.toLowerCase()
        if (operator === '<>') {
            operator = '!=';
        }
        if (typeof right === 'boolean' && ['in', 'not in'].indexOf(operator) !== -1) {
            console.warning(`The domain term '[${[left, original, right]}]' should use the '=' or '!=' operator.`);
            operator = operator == 'in' ? '=': '!=';
        }
        if (right instanceof Array && ['=', '!='].indexOf(operator) !== -1) {
            console.warning(`The domain term '[${[left, original, right]}]' should use the 'in' or 'not in' operator.`);
            operator = operator == '=' ? 'in' : 'not in';
        }
        return [left, operator, right];
    }

    /**
     * Test whether an object is a valid domain operator.
     */
    function is_operator(element) {
        return typeof element === "string" && DOMAIN_OPERATORS.indexOf(element) !== -1;
    }

    /**
     * Test whether an object is a valid domain term:
     *       - is a array
     *       - with 3 elements
     *       - second element if a valid op
     *
     *       :param array element: a leaf in form [left, operator, right]
     *       :param boolean internal: allow or not the 'inselect' internal operator
     *           in the term. This should be always left to False.
     *
     *       Note: OLD TODO change the share wizard to use this function.
     */
    function is_leaf(element, internal=false) {
        let INTERNAL_OPS = TERM_OPERATORS.concat(['<>']);
        if (internal) {
            INTERNAL_OPS = INTERNAL_OPS.concat(['inselect', 'not inselect']);
        }
        return (
            element instanceof Array &&
            element.length === 3 &&
            INTERNAL_OPS.indexOf(element[1]) !== -1 &&
            (
                typeof element[0] === "string" ||
                _.findIndex([TRUE_LEAF, FALSE_LEAF], element) !== -1
            )
        );
    }

    // --------------------------------------------------
    // SQL utils
    // --------------------------------------------------

    async function select_from_where(cr, select_field, from_table, where_field, where_ids, where_operator) {
        // todo: merge into parent query as sub-query
        let res = []
        if (!_.isEmpty(where_ids)) {
            if (['<', '>', '>=', '<='].indexOf(where_operator) !== -1) {
                const records = await cr.all([`SELECT DISTINCT "${select_field}" FROM "${from_table}" WHERE "${where_field}" ${where_operator} ${where_ids[0]}`]);
                res = get_records_ids(records);
            } else {  // TODO where_operator is supposed to be 'in'? It is called with child_of...
                for (let i = 0; i < where_ids.length && i < IN_MAX; ++i) {
                    subids = where_ids.slice(i, i + IN_MAX);
                    const records = await cr.all([`SELECT DISTINCT "${select_field}" FROM "${from_table}" WHERE "${where_field}" IN (${subids})`]);
                    res = res.concat(get_records_ids(records));
                }
            }
        }
        return res
    }

    async function select_distinct_from_where_not_null(cr, select_field, from_table) {
        const records = await cr.all([`SELECT distinct("${select_field}") FROM "${from_table}" where "${select_field}" is not null`]);
        return get_records_ids(records);
    }

    // --------------------------------------------------
    // ExtendedLeaf class for managing leafs and contexts
    // -------------------------------------------------

    /**
     * Class wrapping a domain leaf, and giving some services and management
     * features on it. In particular it managed join contexts to be able to
     * construct queries through multiple models.
     */
    const ExtendedLeaf = OdooClass.extend({

        // --------------------------------------------------
        // Join / Context manipulation
        //   running examples:
        //   - res_users.name, like, foo: name is on res_partner, not on res_users
        //   - res_partner.bank_ids.name, like, foo: bank_ids is a one2many with _auto_join
        //   - res_partner.state_id.name, like, foo: state_id is a many2one with _auto_join
        // A join:
        //   - link between src_table and dst_table, using src_field and dst_field
        //       i.e.: inherits: res_users.partner_id = res_partner.id
        //       i.e.: one2many: res_partner.id = res_partner_bank.partner_id
        //       i.e.: many2one: res_partner.state_id = res_country_state.id
        //   - done in the context of a field
        //       i.e.: inherits: 'partner_id'
        //       i.e.: one2many: 'bank_ids'
        //       i.e.: many2one: 'state_id'
        //   - table names use aliases: initial table followed by the context field
        //     names, joined using a '__'
        //       i.e.: inherits: res_partner as res_users__partner_id
        //       i.e.: one2many: res_partner_bank as res_partner__bank_ids
        //       i.e.: many2one: res_country_state as res_partner__state_id
        //   - join condition use aliases
        //       i.e.: inherits: res_users.partner_id = res_users__partner_id.id
        //       i.e.: one2many: res_partner.id = res_partner__bank_ids.parr_id
        //       i.e.: many2one: res_partner.state_id = res_partner__state_id.id
        // Variables explanation:
        //   - src_table: working table before the join
        //       -> res_users, res_partner, res_partner
        //   - dst_table: working table after the join
        //       -> res_partner, res_partner_bank, res_country_state
        //   - src_table_link_name: field name used to link the src table, not
        //     necessarily a field (because 'id' is not a field instance)
        //       i.e.: inherits: 'partner_id', found in the inherits of the current table
        //       i.e.: one2many: 'id', not a field
        //       i.e.: many2one: 'state_id', the current field name
        //   - dst_table_link_name: field name used to link the dst table, not
        //     necessarily a field (because 'id' is not a field instance)
        //       i.e.: inherits: 'id', not a field
        //       i.e.: one2many: 'partner_id', _fields_id of the current field
        //       i.e.: many2one: 'id', not a field
        //   - context_field_name: field name used as a context to make the alias
        //       i.e.: inherits: 'partner_id': found in the inherits of the current table
        //       i.e.: one2many: 'bank_ids': current field name
        //       i.e.: many2one: 'state_id': current field name
        // --------------------------------------------------

        /**
         * Initialize the ExtendedLeaf
         *
         *       :attr [string, tuple] leaf: operator or tuple-formatted domain
         *           expression
         *       :attr obj model: current working model
         *       :attr list _models: list of chained models, updated when
         *           adding joins
         *       :attr list join_context: list of join contexts. This is a list of
         *           tuples like ``(lhs, table, lhs_col, col, link)``
         +
        *           where
        *
        *           lhs
        *               source (left hand) model
        *           model
        *               destination (right hand) model
        *           lhs_col
        *               source model column for join condition
        *           col
        *               destination model column for join condition
        *           link
        *               link column between source and destination model
        *               that is not necessarily (but generally) a real column used
        *               in the condition (i.e. in many2one); this link is used to
        *               compute aliases
        */
        init: function (leaf, model, join_context=undefined, internal=false) {
            this.join_context = join_context || [];
            this.leaf = leaf;
            // normalize the leaf's operator
            this.normalize_leaf()
            // set working variables; handle the context stack and previous tables
            this.model = model;
            this._models = [];
            for (let item of this.join_context) {
                this._models.push(item[0]);
            }
            this._models.push(model);
            // check validity
            this.check_leaf(internal);
        },

        toString: function () {
            return `<osv.ExtendedLeaf: ${this.leaf} on ${this.table} (ctx: ${this._get_context_debug().join(',')})>`;
        },

        generate_alias: function () {
            const links = this.join_context.map((x) => [context[1].table, context[4]]);
            const [alias, alias_statement] = generate_table_alias(this._models[0].table, links);
            return alias;
        },

        /**
         * See above comments for more details. A join context is a tuple like:
         *   ``(lhs, model, lhs_col, col, link)``
         *
         * After adding the join, the model of the current leaf is updated.
         */
        add_join_context: function (model, lhs_col, table_col, link) {
            this.join_context.push([this.model, model, lhs_col, table_col, link]);
            this._models.push(model);
            this.model = model;
        },

        get_join_conditions: function () {
            const conditions = [];
            let alias = this._models[0].table;
            for (let context of this.join_context) {
                const previous_alias = alias;
                alias += '__' + context[4];
                conditions.push(`"${previous_alias}"."${context[2]}"="${alias}"."${context[3]}"`);
            }
            return conditions;
        },

        get_tables: function () {
            const tables = [];
            const links = [];
            for (let context of this.join_context) {
                links.push([context[1].table, context[4]]);
                [alias, alias_statement] = generate_table_alias(this._models[0].table, links);
                tables.push(alias_statement);
            }
            return _.unique(tables);
        },

        _get_context_debug: function () {
            const names = this.join_context.map((x) => `"${item[0].table}"."${item[2]}"="${item[1].table}"."${item[3]}" (${item[4]})`);
            return names;
        },

        // --------------------------------------------------
        // Leaf manipulation
        // --------------------------------------------------

        /**
         * Leaf validity rules:
         *  - a valid leaf is an operator or a leaf
         *  - a valid leaf has a field objects unless
         *  - it is not a tuple
         *  - it is an inherited field
         *  - left is id, operator is 'child_of'
         *  - left is in MAGIC_COLUMNS
         */
        check_leaf: function (internal=false) {
            if (!is_operator(this.leaf) && !is_leaf(this.leaf, internal)) {
                throw Error(`Invalid leaf ${this.leaf}`);
            }
        },

        is_operator: function () {
            return is_operator(this.leaf);
        },

        is_true_leaf: function () {
            return _.isEqual(this.leaf, TRUE_LEAF);
        },

        is_false_leaf: function () {
            return _.isEqual(this.leaf, FALSE_LEAF);
        },

        is_leaf: function (internal=false) {
            return is_leaf(this.leaf, internal);
        },

        normalize_leaf: function () {
            this.leaf = normalize_leaf(this.leaf);
            return true
        },
    });

    /**
     * From a leaf, create a new leaf (based on the new_elements tuple
     * and new_model), that will have the same join context. Used to
     * insert equivalent leafs in the processing stack. """}
     */
    function create_substitution_leaf(leaf, new_elements, new_model=null, internal=false) {
        if (_.isNull(new_model)) {
            new_model = leaf.model;
        }
        const new_leaf = new ExtendedLeaf(new_elements, new_model, leaf.join_context, internal);
        return new_leaf;
    }

    /**
     * Parse a domain expression
     * Use a real polish notation
     * Leafs are still in a ('foo', '=', 'bar') format
     * For more info: http://christophe-simonis-at-tiny.blogspot.com/2008/08/new-new-domain-notation.html
     */
    const Expression = OdooClass.extend({

        /**
         * Initialize expression object and automatically parse the expression
         * right after initialization.
         *
         * :param domain: expression (using domain ('foo', '=', 'bar' format))
         * :param model: root model
         *
         * :attr list result: list that will hold the result of the parsing
         *    as a list of ExtendedLeaf
         * :attr list joins: list of join conditions, such as
         *    (res_country_state."id" = res_partner."state_id")
         * :attr root_model: base model for the query
         * :attr list expression: the domain expression, that will be normalized
         *    and prepared
         */
        init: function (domain, model_info, dbmanager) {
            this.joins = [];
            this.root_model = model_info;
            this._dbmanager = dbmanager;

            // normalize and prepare the expression for parsing
            this.expression = distribute_not(normalize_domain(domain));
        },

        // ----------------------------------------
        // Leafs management
        // ----------------------------------------

        /**
         * Returns the list of tables for SQL queries, like select from ...
         */
        get_tables: function () {
            const tables = []
            for (let leaf of this.result) {
                const leaf_tables = leaf.get_tables();
                for (let table of leaf_tables) {
                    if (tables.indexOf(table) === -1) {
                        tables.push(table);
                    }
                }
            }
            const table_name = tools.s_quote(this.root_model.table);
            if (tables.indexOf(table_name) === -1) {
                tables.push(table_name);
            }
            return tables;
        },

        // ----------------------------------------
        // Parsing
        // ----------------------------------------

        /**
         * Transform the leaves of the expression
         *
         * The principle is to pop elements from a leaf stack one at a time.
         * Each leaf is processed. The processing is a if/elif list of various
         * cases that appear in the leafs (many2one, function fields, ...).
         * Two things can happen as a processing result:
         * - the leaf has been modified and/or new leafs have to be introduced
             in the expression; they are pushed into the leaf stack, to be
            processed right after
        * - the leaf is added to the result
        *
        * Some internal var explanation:
        *   :var list path: left operand seen as a sequence of field names
        *       ("foo.bar" -> ["foo", "bar"])
        *   :var obj model: model object, model containing the field
        *       (the name provided in the left operand)
        *   :var obj field: the field corresponding to `path[0]`
        *   :var obj column: the column corresponding to `path[0]`
        *   :var obj comodel: relational model of field (field.comodel)
        *       (res_partner.bank_ids -> res.partner.bank)
        */
        parse: function () {
            return new Promise(async (resolve, reject) => {
                /**
                 * Normalize a single id or name, or a list of those, into a list of ids
                 *       :param {int,long,basestring,list,tuple} value:
                 *           if int, long -> return [value]
                 *           if basestring, convert it into a list of basestrings, then
                 *           if list of basestring ->
                 *               perform a name_search on comodel for each name
                 *               return the list of related ids
                 */
                const to_ids = async (value, comodel, leaf) => {
                    let names = [];
                    if (typeof value === "string") {
                        names = [value];
                    } else if (!_.isEmpty(value) && value instanceof Array && _.every(item.map((x) => typeof x === "string"))) {
                        names = value;
                    } else if (value instanceof Number) {
                        if (!value) {
                            // given this nonsensical domain, it is generally cheaper to
                            // interpret False as [], so that "X child_of False" will
                            // match nothing
                            console.warning(`Unexpected domain [${leaf}], interpreted as false`);
                            return [];
                        }
                        return [value];
                    }
                    if (!_.isEmpty(names)) {
                        const res = [];
                        for (let name of names) {
                            const records = await this._dbmanager.name_search(comodel.model, name, [], 'ilike');
                            res.concat(records.map((x) => x[0]));
                        }
                        return res;
                    }
                    return value;
                };

                /**
                 * Return a domain implementing the child_of operator for [(left,child_of,ids)],
                 * either as a range using the parent_path tree lookup field
                 * (when available), or as an expanded [(left,in,child_ids)]
                 */
                const child_of_domain = async (left, ids, left_model, parent, prefix='') => {
                    if (_.isEmty(ids)) {
                        return [FALSE_LEAF];
                    }
                    if (left_model.parent_store) {
                        const records = await this._dbmanager.browse(left_model.model, ids);
                        doms = OR(records.map((x) => [['parent_path', '=like', x.parent_path + '%']]));
                        if (prefix) {
                            const records = await this._dbmanager.search(left_model.model, doms);
                            const ids = get_records_ids(records);
                            return [[left, 'in', ids]];
                        }
                        return doms;
                    } else {
                        const parent_name = parent || left_model.parent_name;
                        child_ids = _.unique(ids);
                        let records = [];
                        while (!_.isEmpty(ids)) {
                            records = await this._dbmanager.search(left_model.model, [[parent_name, 'in', ids]]);
                            ids = get_records_ids(records);
                            child_ids = child_ids.concat(ids);
                        }
                        return [[left, 'in', _.unique(child_ids)]];
                    }
                };

                /**
                 * Return a domain implementing the parent_of operator for [(left,parent_of,ids)],
                 * either as a range using the parent_path tree lookup field
                 * (when available), or as an expanded [(left,in,parent_ids)] """} left
                 */
                const parent_of_domain = async (left, ids, left_model, parent, prefix='') => {
                    if (left_model.parent_store) {
                        const parent_ids = [];
                        const records = await this._dbmanager.browse(left_model.model, ids);
                        for (let record of records) {
                            let labels = record.parent_path.split('/');
                            labels = labels.slice(0, labels.length - 1);
                            for (let label of labels) {
                                parent_ids.push(Number(label));
                            }
                        }
                        if (prefix) {
                            return [[left, 'in', parent_ids]];
                        }
                        return [['id', 'in', parent_ids]];
                    }

                    const parent_name = parent || left_model.parent_name;
                    const parent_ids = [];
                    const records = await this._oddodb.browse(left_model.model, ids);
                    for (let record of records) {
                        while (record) {
                            parent_ids.push(record.id);
                            record = record[parent_name];
                        }
                    }
                    return [[left, 'in', _.unique(parent_ids)]];
                };

                const HIERARCHY_FUNCS = {
                    'child_of': child_of_domain,
                    'parent_of': parent_of_domain,
                };

                /**
                 * Pop a leaf to process.
                 */
                const pop = () => this.stack.pop();

                /**
                 * Push a leaf to be processed right after.
                 */
                const push = (leaf) => this.stack.push(leaf);

                /**
                 * Push a leaf to the results. This leaf has been fully processed
                 * and validated.
                 */
                const push_result = (leaf) => this.result.push(leaf);

                this.result = [];
                const ttest = new ExtendedLeaf(this.expression[0], this.root_model);
                this.stack = this.expression.map((leaf) => new ExtendedLeaf(leaf, this.root_model));

                // process from right to left; expression is from left to right
                this.stack.reverse();

                while (!_.isEmpty(this.stack)) {
                    // Get the next leaf to process
                    const leaf = this.stack.pop();

                    let [left, operator, right] = [undefined, undefined, undefined];
                    // Get working variables
                    if (leaf.is_operator()) {
                        [left, operator, right] = [leaf.leaf, undefined, undefined];
                    } else if (leaf.is_true_leaf() || leaf.is_false_leaf()) {
                        // because we consider left as a string
                        [left, operator, right] = [String(leaf.leaf[0]), leaf.leaf[1], leaf.leaf[2]];
                    } else {
                        [left, operator, right] = leaf.leaf;
                    }
                    const path = left.split('.', 1);

                    const model = leaf.model;
                    const field = model.fields[path[0]];
                    const comodel = await this._dbmanager.sqlitedb.getModelInfo(field?.comodel_name);

                    // ----------------------------------------
                    // SIMPLE CASE
                    // 1. leaf is an operator
                    // 2. leaf is a true/false leaf
                    // -> add directly to result
                    // ----------------------------------------

                    if (leaf.is_operator() || leaf.is_true_leaf() || leaf.is_false_leaf()) {
                        push_result(leaf);
                    }

                    // ----------------------------------------
                    // FIELD NOT FOUND
                    // -> from inherits'd fields -> work on the related model, and add
                    //    a join condition
                    // -> ('id', 'child_of', '..') -> use a 'to_ids'
                    // -> but is one on the _log_access special fields, add directly to
                    //    result
                    //    TODO: make these fields explicitly available in self.columns instead!
                    // -> else: crash
                    // ----------------------------------------

                    else if (_.isEmpty(field)) {
                        throw Error(`Invalid field ${left} in leaf ${leaf}`);
                    }

                    else if (field.inherited) {
                        // comments about inherits'd fields
                        //  { 'field_name': ('parent_model', 'm2o_field_to_reach_parent',
                        //                    field_column_obj, origina_parent_model), ... }
                        const parent_model = await this._dbmanager.sqlitedb.getModelInfo(field.related_field.model_name);
                        const parent_fname = model.inherits[parent_model.model];
                        leaf.add_join_context(parent_model, parent_fname, 'id', parent_fname);
                        push(leaf);
                    }

                    else if (left === 'id' && operator in HIERARCHY_FUNCS) {
                        const ids2 = to_ids(right, model, leaf.leaf);
                        const dom = await HIERARCHY_FUNCS[operator](left, ids2, model).reverse();
                        let new_leaf = undefined;
                        for (let dom_leaf of dom) {
                            new_leaf = create_substitution_leaf(leaf, dom_leaf, model);
                            push(new_leaf);
                        }
                    }

                    // // ----------------------------------------
                    // // PATH SPOTTED
                    // // -> many2one or one2many with _auto_join:
                    // //    - add a join, then jump into linked column: column.remaining on
                    // //      src_table is replaced by remaining on dst_table, and set for re-evaluation
                    // //    - if a domain is defined on the column, add it into evaluation
                    // //      on the relational table
                    // // -> many2one, many2many, one2many: replace by an equivalent computed
                    // //    domain, given by recursively searching on the remaining of the path
                    // // -> note: hack about columns.property should not be necessary anymore
                    // //    as after transforming the column, it will go through this loop once again
                    // // ----------------------------------------

                    // else if (path.length > 1 && field.store && field.type === 'many2one' && field.auto_join) {
                    //     // res_partner.state_id = res_partner__state_id.id
                    //     leaf.add_join_context(comodel, path[0], 'id', path[0]);
                    //     push(create_substitution_leaf(leaf, [path[1], operator, right], comodel));
                    // }

                    // else if (path.length > 1 && field.store && field.type === 'one2many' && field.auto_join) {
                    //     // res_partner.id = res_partner__bank_ids.partner_id
                    //     leaf.add_join_context(comodel, 'id', field.inverse_name, path[0])
                    //     let domain = isCalleable(field.domain) ? field.domain(model) : field.domain;
                    //     push(create_substitution_leaf(leaf, [path[1], operator, right], comodel));
                    //     if (!_.isEmpty(domain)) {
                    //         domain = normalize_domain(domain).reverse();
                    //         for (let elem of domain) {
                    //             push(create_substitution_leaf(leaf, elem, comodel));
                    //         }
                    //         push(create_substitution_leaf(leaf, AND_OPERATOR, comodel));
                    //     }
                    // }

                    // else if (path.length > 1 && field.store && field.auto_join) {
                    //     throw Error(`auto_join attribute not supported on field ${field}`);
                    // }

                    // else if (path.length > 1 && field.store && field.type == 'many2one') {
                    //     // FIXME: Client side allways uses 'active_test' = True
                    //     const records = await this._dbmanager.search(comodel.model, [[path.slice(1).join('.'), operator, right]]);
                    //     const right_ids = get_records_ids(records);
                    //     leaf.leaf = (path[0], 'in', right_ids);
                    //     push(leaf);
                    // }

                    // // Making search easier when there is a left operand as one2many or many2many
                    // else if (path.length > 1 && field.store && ['many2many', 'one2many'].indexOf(field.type) !== -1) {
                    //     const records = await this._dbmanager.search(comodel.model, [[path.slice(1).join('.'), operator, right]]);
                    //     const right_ids = get_records_ids(records);
                    //     leaf.leaf = (path[0], 'in', right_ids);
                    //     push(leaf);
                    // }

                    // else if (!field.store) {
                    //     let domain = [];
                    //     // Non-stored field should provide an implementation of search.
                    //     if (!field.search) {
                    //         // field does not support search!
                    //         console.error(`Non-stored field ${field} cannot be searched.`);
                    //         // Ignore it: generate a dummy leaf.
                    //     } else {
                    //         // Let the field generate a domain.
                    //         if (path.length > 1) {
                    //             const records = await this._dbmanager.search(comodel.model, [[path.slice(1).join('.'), operator, right]]);
                    //             right = get_records_ids(records);
                    //             operator = 'in';
                    //         }
                    //         domain = field.determine_domain(model, operator, right);
                    //     }

                    //     // replace current leaf by normalized domain
                    //     const domains = normalize_domain(domain).reverse();
                    //     for (let elem of domains) {
                    //         push(create_substitution_leaf(leaf, elem, model, true))
                    //     }
                    // }

                    // // -------------------------------------------------
                    // // RELATIONAL FIELDS
                    // // -------------------------------------------------

                    // // Applying recursivity on field(one2many)
                    // else if (field.type === 'one2many' && operator in HIERARCHY_FUNCS) {
                    //     const ids2 = to_ids(right, comodel, leaf.leaf);
                    //     let dom = [];
                    //     if (field.comodel_name !== model.model) {
                    //         dom = await HIERARCHY_FUNCS[operator](left, ids2, comodel, undefined, field.comodel_name);
                    //     } else {
                    //         dom = await HIERARCHY_FUNCS[operator]('id', ids2, model, left);
                    //     }
                    //     dom.reverse();
                    //     for (let dom_leaf of dom) {
                    //         push(create_substitution_leaf(leaf, dom_leaf, model));
                    //     }
                    // }

                    // else if (field.type === 'one2many') {
                    //     let domain = field.domain;
                    //     if (isCalleable(domain)) {
                    //         domain = domain(model)
                    //     }
                    //     const inverse_is_int = comodel.fields[field.inverse_name].type === 'integer';
                    //     const unwrap_inverse = (ids) => {
                    //         return inverse_is_int ? ids : get_records_ids(ids);
                    //     }

                    //     if (right !== false) {
                    //         let ids2 = [];
                    //         // determine ids2 in comodel
                    //         if (typeof right === "string") {
                    //             const op2 = operator in NEGATIVE_TERM_OPERATORS ? TERM_OPERATORS_NEGATION[operator] : operator;
                    //             const records = await this._dbmanager.name_search(comodel.model, right, domain || [], op2)
                    //             ids2 = records.map((x) => x[0]);
                    //         } else if (isIterable(right)) {
                    //             ids2 = right;
                    //         } else {
                    //             ids2 = [right];
                    //         }
                    //         if (!_.isEmpty(ids2) && inverse_is_int && !_.isEmpty(domain)) {
                    //             const records = await this._dbmanager.search(comodel.model, [('id', 'in', ids2)].concat(domain));
                    //             ids2 = get_records_ids(records);
                    //         }

                    //         let ids1 = [];
                    //         // determine ids1 in model related to ids2
                    //         if (_.isEmpty(ids2)) {
                    //             ids1 = [];
                    //         } else if (comodel.fields[field.inverse_name].store) {
                    //             ids1 = await select_from_where(cr, field.inverse_name, comodel.table, 'id', ids2, operator)
                    //         } else {
                    //             const recs = await this._dbmanager.browse(comodel.model, ids2, {prefetch_fields: false});
                    //             ids1 = unwrap_inverse(recs.map((x) => x[field.inverse_name]));
                    //         }

                    //         // rewrite condition in terms of ids1
                    //         const op1 = NEGATIVE_TERM_OPERATORS.indexOf(operator) === -1 ? "in" : "not in";
                    //         push(create_substitution_leaf(leaf, ['id', op1, ids1], model));
                    //     }

                    //     else {
                    //         let ids1 = [];
                    //         // determine ids1 = records with lines
                    //         if (comodel.fields[field.inverse_name].store && !(inverse_is_int && !_.isEmpty(domain))) {
                    //             ids1 = await select_distinct_from_where_not_null(cr, field.inverse_name, comodel.table)
                    //         }
                    //         else {
                    //             comodel_domain = [[field.inverse_name, '!=', false]];
                    //             if (inverse_is_int && !_.isEmpty(domain)) {
                    //                 comodel_domain += domain;
                    //             }
                    //             const recs = await this._oododb.search(comodel.model, comodel_domain, undefined, undefined, undefined, {prefetch_fields: false});
                    //             ids1 = unwrap_inverse(recs.map((x) => x[field.inverse_name]));
                    //         }

                    //         // rewrite condition to match records with/without lines
                    //         const op1 = NEGATIVE_TERM_OPERATORS.indexOf(operator) === -1 ? "not in" : "in";
                    //         push(create_substitution_leaf(leaf, ['id', op1, ids1], model));
                    //     }
                    // }

                    // else if (field.type === 'many2many') {
                    //     const [rel_table, rel_id1, rel_id2] = [field.relation, field.column1, field.column2];

                    //     if (operator in HIERARCHY_FUNCS) {
                    //         // determine ids2 in comodel
                    //         const ids2 = to_ids(right, comodel, leaf.leaf);
                    //         const domain = await HIERARCHY_FUNCS[operator]('id', ids2, comodel);
                    //         const records = await this._dbmanager.search(comodel.model, domain);
                    //         ids2 = get_records_ids(records);

                    //         // rewrite condition in terms of ids2
                    //         if (comodel.model === model.model) {
                    //             push(create_substitution_leaf(leaf, ['id', 'in', ids2], model));
                    //         } else {
                    //             const subquery = `SELECT "${rel_id1}" FROM "${rel_table}" WHERE "${rel_id2}" IN (${ids2})`;
                    //             push(create_substitution_leaf(leaf, ['id', 'inselect', subquery], undefined, true));
                    //         }
                    //     }

                    //     else if (right !== false) {
                    //         let ids2 = [];
                    //         // determine ids2 in comodel
                    //         if (typeof right === "string") {
                    //             let domain = field.domain
                    //             if (isCalleable(domain)) {
                    //                 domain = domain(model)
                    //             }
                    //             const op2 = NEGATIVE_TERM_OPERATORS.indexOf(operator) == -1 ? operator : NEGATIVE_TERM_OPERATORS[operator];
                    //             const records = await this._dbmanager.name_search(comodel.model, right, domain || [], op2);
                    //             ids2 = records.map((x) => x[0]);
                    //         } else if (isIterable(right)) {
                    //             ids2 = right;
                    //         } else {
                    //             ids2 = [right];
                    //         }

                    //         // rewrite condition in terms of ids2
                    //         const subop = NEGATIVE_TERM_OPERATORS.indexOf(operator) === -1 ? 'inselect' : 'not inselect';
                    //         const subquery = `SELECT "${rel_id1}" FROM "${rel_table}" WHERE "${rel_id2}" IN (${ids2})`;
                    //         push(create_substitution_leaf(leaf, ['id', subop, subquery], undefined, true));
                    //     }

                    //     else {
                    //         // determine ids1 = records with relations
                    //         const ids1 = await select_distinct_from_where_not_null(cr, rel_id1, rel_table);

                    //         // rewrite condition to match records with/without relations
                    //         const op1 = NEGATIVE_TERM_OPERATORS.indexOf(operator) === -1 ? 'not in' : 'in';
                    //         push(create_substitution_leaf(leaf, ['id', op1, ids1], model));
                    //     }
                    // }

                    // else if (field.type == 'many2one') {
                    //     if (operator in HIERARCHY_FUNCS) {
                    //         const ids2 = to_ids(right, comodel, leaf.leaf);
                    //         let dom = [];
                    //         if (field.comodel_name != model.model) {
                    //             dom = await HIERARCHY_FUNCS[operator](left, ids2, comodel, undefined, field.comodel_name);
                    //         } else {
                    //             dom = await HIERARCHY_FUNCS[operator]('id', ids2, model, left);
                    //         }
                    //         dom.reverse();
                    //         for (let dom_leaf of dom) {
                    //             push(create_substitution_leaf(leaf, dom_leaf, model));
                    //         }
                    //     }
                    //     else {
                    //         const _get_expression = async (comodel, left, right, operator) => {
                    //             // Special treatment to ill-formed domains
                    //             operator = (['<', '>', '<=', '>='].indexOf(operator) !== -1) && 'in' || operator;

                    //             const dict_op = {'not in': '!=', 'in': '=', '=': 'in', '!=': 'not in'}
                    //             if (!(right instanceof Array) && ['not in', 'in'].indexOf(operator) !== -1) {
                    //                 operator = dict_op[operator];
                    //             }
                    //             else if (right instanceof Array && ['!=', '='].indexOf(operator) !== -1) {  // for domain (FIELD,'=',['value1','value2'])
                    //                 operator = dict_op[operator];
                    //             }
                    //             const records = await this._dbmanager.name_search(comodel.model, right, [], operator);
                    //             const res_ids = records.map((x) => x[0]);
                    //             if (NEGATIVE_TERM_OPERATORS.indexOf(operator) !== -1) {
                    //                 res_ids.push(false)  // TODO this should not be appended if False was in 'right'
                    //             }
                    //             return [left, 'in', res_ids];
                    //         }
                    //         // resolve string-based m2o criterion into IDs
                    //         if (
                    //             typeof right === "string" ||
                    //             right && right instanceof Array && _.every(right.map((x) => typeof x === 'string'))
                    //         ) {
                    //             push(create_substitution_leaf(leaf, await _get_expression(comodel, left, right, operator), model));
                    //         } else {
                    //             // right == [] or right == False and all other cases are handled by __leaf_to_sql()
                    //             push_result(leaf);
                    //         }
                    //     }
                    // }

                    // -------------------------------------------------
                    // BINARY FIELDS STORED IN ATTACHMENT
                    // -> check for null only
                    // -------------------------------------------------

                    else if (field.type == 'binary' && field.attachment) {
                        if (['=', '!='].indexOf(operator) !== -1 && right) {
                            const inselect_operator = NEGATIVE_TERM_OPERATORS.indexOf(operator) === -1 ? 'not inselect' : 'inselect';
                            const subselect = `SELECT res_id FROM ir_attachment WHERE res_model=${model.model} AND res_field=${left}`;
                            push(create_substitution_leaf(leaf, ['id', inselect_operator, subselect], model, true));
                        } else {
                            console.error(`Binary field '${field.string}' stored in attachment: ignore ${left} ${operator} ${right}`);
                            leaf.leaf = TRUE_LEAF;
                            push(leaf);
                        }
                    }

                    // -------------------------------------------------
                    // OTHER FIELDS
                    // -> datetime fields: manage time part of the datetime
                    //    column when it is not there
                    // -> manage translatable fields
                    // -------------------------------------------------

                    else {
                        if (field.type == 'datetime' && right) {
                            if (typeof right === "string" && right.length == 10) {
                                if (['>', '<='].indexOf(operator) !== -1) {
                                    right += ' 23:59:59';
                                } else {
                                    right += ' 00:00:00';
                                }
                                push(create_substitution_leaf(leaf, [left, operator, right], model));
                            }
                            // else if (isinstance(right, date) and not isinstance(right, datetime)) {
                            //     if operator in ('>', '<='):
                            //         right = datetime.combine(right, time.max)
                            //     else:
                            //         right = datetime.combine(right, time.min)
                            //     push(create_substitution_leaf(leaf, (left, operator, right), model))
                            // }
                            else {
                                push_result(leaf);
                            }
                        }

                        else if (field.translate && right) {
                            const need_wildcard = ['like', 'ilike', 'not like', 'not ilike'].indexOf(operator) !== -1;
                            let sql_operator = {'=like': 'like', '=ilike': 'ilike'}[operator] || operator;
                            if (need_wildcard) {
                                right = `%${right}%`;
                            }
                            let inselect_operator = 'inselect'
                            if (NEGATIVE_TERM_OPERATORS.indexOf(sql_operator) !== -1) {
                                // negate operator (fix lp:1071710)
                                sql_operator = sql_operator.substr(0, 3) === 'not' ? sql_operator.substr(4) : '=';
                                inselect_operator = 'not inselect';
                            }

                            if (sql_operator === 'in') {
                                right = `[${right}]`;
                            }

                            subselect = `WITH temp_irt_current (id, name) as (
                                    SELECT ct.id, coalesce(it.value,ct.${quote_left})
                                    FROM ${current_table} ct
                                    LEFT JOIN ir_translation it ON (it.name = ${model.table + ',' + left} and
                                                it.lang = ${model.env.lang || 'en_US'} and
                                                it.type = 'model' and
                                                it.res_id = ct.id and
                                                it.value != '')
                                    )
                                    SELECT id FROM temp_irt_current WHERE name ${operator} ${right} order by name`;
                            push(create_substitution_leaf(leaf, ['id', inselect_operator, subselect], model, true));
                        }

                        else {
                            push_result(leaf);
                        }
                    }
                }

                // ----------------------------------------
                // END OF PARSING FULL DOMAIN
                // -> generate joins
                // ----------------------------------------

                let joins = [];
                for (let leaf of this.result) {
                    joins = joins.concat(leaf.get_join_conditions());
                }
                this.joins = _.unique(joins);

                return resolve();
            });
        },

        __leaf_to_sql: function (eleaf) {
            const model = eleaf.model;
            const leaf = eleaf.leaf;
            const [left, operator, right] = leaf;

            const table_alias = `"${eleaf.generate_alias()}"`;

            let query = undefined;
            let params = undefined;
            if (_.isEqual(leaf, TRUE_LEAF)) {
                query = 'TRUE';
                params = [];
            } else if (_.isEqual(leaf, FALSE_LEAF)) {
                query = 'FALSE';
                params = [];
            } else if (operator === 'inselect') {
                query = `(${table_alias}."${left}" in (${right[0]}))`;
                params = right[1];
            } else if (operator === 'not inselect') {
                query = `(${table_alias}."${left}" not in (${right[0]}))`;
                params = right[1];
            } else if (RELATIONAL_COLUMN_TYPES.indexOf(model.fields[left].type) !== -1) {
                const is_positive_operator = NEGATIVE_TERM_OPERATORS.indexOf(operator) === -1;
                const cond_operator = is_positive_operator ? "LIKE" : "NOT LIKE";
                const conds = [];
                if (right instanceof Array) {
                    params = [];
                    for (let right_id of right) {
                        conds.push(`${table_alias}."${left}" ${cond_operator} "%s"`);
                        params.push(`%||${right_id}||%`)
                    }
                    params = right;
                } else if (typeof right === "boolean") {
                    if ((is_positive_operator && right) || (!is_positive_operator && !right)) {
                        conds.push(`${table_alias}."${left}" IS NOT NULL`);
                    } else {
                        conds.push(`${table_alias}."${left}" IS NULL`);
                    }
                    params = [];
                } else {
                    conds.push(`${table_alias}."${left}" ${cond_operator} "%s"`);
                    params = [`%||${right}||%`];
                }
                query = `(${conds.join(is_positive_operator ? " OR " : " AND ")})`;
            } else if (['in', 'not in'].indexOf(operator) !== -1) {
                // Two cases: right is a boolean or a list. The boolean case is an
                // abuse and handled for backward compatibility.
                if (typeof right === "boolean") {
                    console.warning(`The domain term '${leaf}' should use the '=' or '!=' operator.`)
                    if ((operator === 'in' && right) || (operator === 'not in' && !right)) {
                        query = `(${table_alias}."${left}" IS NOT NULL)`;
                    } else {
                        query = `(${table_alias}."${left}" IS NULL)`;
                    }
                    params = [];
                } else if (right instanceof Array) {
                    let check_null = false;
                    if (model.fields[left].type === "boolean") {
                        const values = [true, false];
                        params = [];
                        for (let it of values) {
                            if (right.indexOf(it) !== -1) {
                                params.push(it);
                            }
                        }
                        check_null = right.indexOf(false) !== -1;
                    }
                    else {
                        params = [];
                        for (let it of right) {
                            if (it) {
                                params.push(it);
                            }
                        }
                        check_null = params.length < right.length;
                    }
                    if (!_.isEmpty(params)) {
                        let instr = '';
                        if (left === 'id') {
                            instr = new Array(params.length).fill('%s').join(',');
                        }
                        else {
                            const field = model.fields[left];
                            instr = new Array(params.length).fill(field.column_format).join(',');
                            params = params.map((x) => convert_to_column(field, x));
                        }
                        query = `(${table_alias}."${left}" ${operator} (${instr}))`;
                    }
                    else {
                        // The case for (left, 'in', []) or (left, 'not in', []).
                        query = operator === 'in' ? 'FALSE' : 'TRUE';
                    }
                    if ((operator === 'in' && check_null) || (operator === 'not in' && !check_null)) {
                        query = `(${query} OR ${table_alias}."${left}" IS NULL)`;
                    }
                    else if (operator === 'not in' && check_null) {
                        query = `(${query} AND ${table_alias}."${left}" IS NOT NULL)`; // needed only for TRUE.
                    }
                }
                else {  // Must not happen
                    throw Error(`Invalid domain term ${leaf}`);
                }
            }

            else if (left in model.fields && model.fields[left].type === "boolean" && ((operator === '=' && !right) || (operator === '!=' && right))) {
                query = `(${table_alias}."${left}" IS NULL or ${table_alias}."${left}" = false )`;
                params = [];
            }

            else if (!right && operator === '=') {
                query = `${table_alias}."${left}" IS NULL `;
                params = [];
            }

            else if (left in model.fields && model.fields[left].type === "boolean" && ((operator === '!=' && !right) || (operator === '==' && right))) {
                query = `(${table_alias}."${left}" IS NOT NULL and ${table_alias}."${left}" != 0)`;
                params = [];
            }

            else if (!right && operator === '!=') {
                query = `${table_alias}."${left}" IS NOT NULL`;
                params = [];
            }

            else if (operator === '=?') {
                if (!right) {
                    // '=?' is a short-circuit that makes the term TRUE if right is None or False
                    query = 'TRUE';
                    params = [];
                }
                else {
                    // '=?' behaves like '=' in other cases
                    [query, params] = this.__leaf_to_sql(
                        create_substitution_leaf(eleaf, [left, '=', right], model));
                }
            }

            else {
                const need_wildcard = ['like', 'ilike', 'not like', 'not ilike'].indexOf(operator) !== -1;
                const sql_operators = {'=like': 'like', '=ilike': 'ilike'};
                const sql_operator = sql_operators[operator] || operator;
                const cast = sql_operator.endsWith('like') ? 'TEXT' : '';

                if (!(left in model.fields)) {
                    throw Error(`Invalid field ${left} in domain term ${leaf}`);
                }
                //const format = need_wildcard ? '%s' : model_fields[left].column_format;
                const format =  "%s";
                const column = `${table_alias}.${tools.s_quote(left)}`;
                if (cast) {
                    query = `(CAST(${column} AS ${cast}) ${sql_operator} ${format})`;
                } else {
                    query = `(${column} ${sql_operator} ${format})`;
                }

                if (need_wildcard) {
                    if (typeof right !== "string") {
                        query = `(${query} OR ${table_alias}."${left}" IS NULL)`;
                    }
                    params = [`"%${right}%"`];
                }
                else {
                    const field = model.fields[left];
                    params = [convert_to_column(field, right)];
                }
            }

            return [query, params];
        },

        to_sql: function () {
            const stack = [];                      // stack of query strings
            let params = [];                     // query parameters, in reverse order

            // Process the domain from right to left, using a stack, to generate a SQL expression.
            const _result = _.clone(this.result).reverse();
            for (let leaf of _result) {
                if (leaf.is_leaf(undefined, true)) {
                    const [q, ps] = this.__leaf_to_sql(leaf);
                    stack.push(q);
                    params = params.concat(ps.reverse());
                }
                else if (leaf.leaf === NOT_OPERATOR) {
                    stack.append(`(NOT (${stack.pop()}))`);
                }
                else {
                    const ops = {[AND_OPERATOR]: ' AND ', [OR_OPERATOR]: ' OR '};
                    const q1 = stack.pop();
                    const q2 = stack.pop();
                    stack.push(`(${q1} ${ops[leaf.leaf]} ${q2})`);
                }
            }

            let query = stack[0];
            const joins = this.joins.join(' AND ');
            if (!_.isEmpty(joins)) {
                query = `(${joins}) AND ${query}`;
            }

            params.reverse();
            return [query, params];
        },
    });

    return {
        get_records_ids: get_records_ids,
        column_string_encode: column_string_encode,
        convert_to_column: convert_to_column,
        normalize_domain: normalize_domain,
        is_false: is_false,
        combine: combine,
        AND: AND,
        OR: OR,
        distribute_not: distribute_not,
        generate_table_alias: generate_table_alias,
        get_alias_from_query: get_alias_from_query,
        normalize_leaf: normalize_leaf,
        is_operator: is_operator,
        is_leaf: is_leaf,
        select_from_where: select_from_where,
        select_distinct_from_where_not_null: select_distinct_from_where_not_null,

        ExtendedLeaf: ExtendedLeaf,
        Expression: Expression,
    };

});
