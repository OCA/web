import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {session} from "@web/session";

export function evaluateSystemParameterDefaultTrue(option) {
    const isOptionSet = session.web_m2x_options?.[`web_m2x_options.${option}`];
    return isOptionSet ? evaluateBooleanExpr(isOptionSet) : true;
}

export function m2x_options_props_create(props, attrs, options) {
    const canQuickCreate = evaluateSystemParameterDefaultTrue("create");
    if (options.no_create || options.no_quick_create) {
        props.canQuickCreate = false;
    } else if ("no_quick_create" in options) {
        props.canQuickCreate = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    } else if (!canQuickCreate && props.canQuickCreate) {
        props.canQuickCreate = false;
    } else if (canQuickCreate && !props.canQuickCreate) {
        props.canQuickCreate = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    }
    return props;
}

export function m2x_options_props_create_edit(props, attrs, options) {
    const canCreateEdit = evaluateSystemParameterDefaultTrue("create_edit");
    if (options.no_create || options.no_create_edit) {
        props.canCreateEdit = false;
    } else if ("no_create_edit" in options) {
        // Same condition set in web/views/fields/many2one/many2one_field
        props.canCreateEdit = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    } else if (!canCreateEdit && props.canCreateEdit) {
        props.canCreateEdit = false;
    } else if (canCreateEdit && !props.canCreateEdit) {
        // Same condition set in web/views/fields/many2one/many2one_field
        props.canCreateEdit = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    }
    return props;
}

export function m2x_options_props_limit(props, attrs, options) {
    const ir_options = session.web_m2x_options;
    let searchLimit = 0;
    if (Number(options.limit)) {
        searchLimit = Number(options.limit);
    } else if (Number(ir_options["web_m2x_options.limit"])) {
        searchLimit = Number(ir_options["web_m2x_options.limit"]);
    }
    if (searchLimit > 0) {
        props.searchLimit = Math.max(searchLimit - 1, 0);
    }
    return props;
}

export function m2x_options_props_open(props, attrs, options) {
    if (!("no_open" in options)) {
        props.canOpen = evaluateSystemParameterDefaultTrue("open");
    }
    return props;
}

export function m2x_options_props(props, attrs, options) {
    let newProps = props;
    newProps = m2x_options_props_create(newProps, attrs, options);
    newProps = m2x_options_props_create_edit(newProps, attrs, options);
    newProps = m2x_options_props_limit(newProps, attrs, options);
    newProps = m2x_options_props_open(newProps, attrs, options);
    newProps.fieldColor = options.field_color;
    newProps.fieldColorOptions = options.colors;
    return newProps;
}
