odoo.define('web.domain_field', function (require) {
"use strict";

var pyeval = require('web.pyeval');
var session = require('web.session');


var original_pyeval = pyeval.eval;
var original_ensure_evaluated = pyeval.ensure_evaluated;
var py = window.py;

/** copied from pyeval and not modified but required since not publicly
exposed by web.pyeval**/

// recursively wraps JS objects passed into the context to attributedicts
// which jsonify back to JS objects
function wrap(value) {
    if (value === null) { return py.None; }

    switch (typeof value) {
    case 'undefined': throw new Error("No conversion for undefined");
    case 'boolean': return py.bool.fromJSON(value);
    case 'number': return py.float.fromJSON(value);
    case 'string': return py.str.fromJSON(value);
    }

    switch(value.constructor) {
    case Object: return wrapping_dict.fromJSON(value);
    case Array: return wrapping_list.fromJSON(value);
    }

    throw new Error("ValueError: unable to wrap " + value);
}

var wrapping_dict = py.type('wrapping_dict', null, {
    __init__: function () {
        this._store = {};
    },
    __getitem__: function (key) {
        var k = key.toJSON();
        if (!(k in this._store)) {
            throw new Error("KeyError: '" + k + "'");
        }
        return wrap(this._store[k]);
    },
    __getattr__: function (key) {
        return this.__getitem__(py.str.fromJSON(key));
    },
    __len__: function () {
        return Object.keys(this._store).length
    },
    __nonzero__: function () {
        return py.PY_size(this) > 0 ? py.True : py.False;
    },
    get: function () {
        var args = py.PY_parseArgs(arguments, ['k', ['d', py.None]]);

        if (!(args.k.toJSON() in this._store)) { return args.d; }
        return this.__getitem__(args.k);
    },
    fromJSON: function (d) {
        var instance = py.PY_call(wrapping_dict);
        instance._store = d;
        return instance;
    },
    toJSON: function () {
        return this._store;
    },
});

var wrapping_list = py.type('wrapping_list', null, {
    __init__: function () {
        this._store = [];
    },
    __getitem__: function (index) {
        return wrap(this._store[index.toJSON()]);
    },
    __len__: function () {
        return this._store.length;
    },
    __nonzero__: function () {
        return py.PY_size(this) > 0 ? py.True : py.False;
    },
    fromJSON: function (ar) {
        var instance = py.PY_call(wrapping_list);
        instance._store = ar;
        return instance;
    },
    toJSON: function () {
        return this._store;
    },
});

function wrap_context (context) {
    for (var k in context) {
        if (!context.hasOwnProperty(k)) { continue; }
        var val = context[k];

        if (val === null) { continue; }
        if (val.constructor === Array) {
            context[k] = wrapping_list.fromJSON(val);
        } else if (val.constructor === Object
                   && !py.PY_isInstance(val, py.object)) {
            context[k] = wrapping_dict.fromJSON(val);
        }
    }
    return context;
}

function ensure_evaluated (args, kwargs) {
    for (var i=0; i<args.length; ++i) {
        args[i] = eval_arg(args[i]);
    }
    for (var k in kwargs) {
        if (!kwargs.hasOwnProperty(k)) { continue; }
        kwargs[k] = eval_arg(kwargs[k]);
    }
}
function eval_contexts (contexts, evaluation_context) {
    evaluation_context = _.extend(pyeval.context(), evaluation_context || {});
    return _(contexts).reduce(function (result_context, ctx) {
        // __eval_context evaluations can lead to some of `contexts`'s
        // values being null, skip them as well as empty contexts
        if (_.isEmpty(ctx)) { return result_context; }
        if (_.isString(ctx)) {
            // wrap raw strings in context
            ctx = { __ref: 'context', __debug: ctx };
        }
        var evaluated = ctx;
        switch(ctx.__ref) {
        case 'context':
            evaluation_context.context = evaluation_context;
            evaluated = py.eval(ctx.__debug, wrap_context(evaluation_context));
            break;
        case 'compound_context':
            var eval_context = eval_contexts([ctx.__eval_context]);
            evaluated = eval_contexts(
                ctx.__contexts, _.extend({}, evaluation_context, eval_context));
            break;
        }
        // add newly evaluated context to evaluation context for following
        // siblings
        _.extend(evaluation_context, evaluated);
        return _.extend(result_context, evaluated);
    }, {});
}

/** end of unmodified methods copied from pyeval **/

// We need to override the original method to be able to call our
//specialized version of pyeval for domain fields
function eval_arg (arg) {
    if (typeof arg !== 'object' || !arg.__ref) { return arg; }
    switch(arg.__ref) {
    case 'domain': case 'compound_domain':
        return domain_field_pyeval('domains', [arg]);
    case 'context': case 'compound_context':
        return original_pyeval('contexts', [arg]);
    default:
        throw new Error(_t("Unknown nonliteral type ") + ' ' + arg.__ref);
    }
}

// override eval_domains to add 3 lines in order to be able to use a field
//value as domain
function eval_domains (domains, evaluation_context) {
    evaluation_context = _.extend(pyeval.context(), evaluation_context ||
    {});
    var result_domain = [];
    _(domains).each(function (domain) {
        if (_.isString(domain)) {
           // Modified part or the original method
           if(domain in evaluation_context) {
                result_domain.push.apply(
                    result_domain, $.parseJSON(evaluation_context[domain]));
                return;
           }
           // end of modifications

           // wrap raw strings in domain
           domain = { __ref: 'domain', __debug: domain };
        }
        switch(domain.__ref) {
        case 'domain':
            evaluation_context.context = evaluation_context;
            result_domain.push.apply(
                result_domain, py.eval(domain.__debug, wrap_context(evaluation_context)));
            break;
        case 'compound_domain':
            var eval_context = eval_contexts([domain.__eval_context]);
            result_domain.push.apply(
                result_domain, eval_domains(
                    domain.__domains, _.extend(
                        {}, evaluation_context, eval_context)));
            break;
        default:
            result_domain.push.apply(result_domain, domain);
        }
    });
    return result_domain;
}

// override pyeval in order to call our specialized implementation of
// eval_domains
function domain_field_pyeval (type, object, context, options) {
    switch(type) {
    case 'domain':
    case 'domains':
        if (type === 'domain')
            object = [object];
        return eval_domains(object, context);
    default:
        return original_pyeval(type, object, context, options);
     }
}

// override sync_eval in order to call our specialized implementation of
// eval_domains
function sync_eval_domains_and_contexts (source) {
    var contexts = ([session.user_context] || []).concat(source.contexts);
    // see Session.eval_context in Python
    return {
        context: domain_field_pyeval('contexts', contexts),
        domain: domain_field_pyeval('domains', source.domains),
        group_by: domain_field_pyeval('groupbys', source.group_by_seq || [])
    };
}

pyeval.eval = domain_field_pyeval;
pyeval.ensure_evaluated = ensure_evaluated;
pyeval.sync_eval_domains_and_contexts = sync_eval_domains_and_contexts;

});