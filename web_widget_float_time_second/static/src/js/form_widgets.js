openerp.web_widget_float_time_second = function(instance) {

    get_float_conf_value = function() {
        if (_.isUndefined(this.is_with_seconds_loaded)) {
            var self = this; // Needed for binding the instance
            this.is_with_seconds_loaded = $.Deferred();
            this.load_seconds = false;
            (new instance.web.Model("ir.config_parameter"))
                .query(["value"])
                .filter([['key', '=', 'float.time.second']])
                .first()
                .then(function(param) {
                    if (param) {
                        self.load_seconds = (param.value.toLowerCase() == 'true');
                    }
                    self.is_with_seconds_loaded.resolve();
                });
            return this.is_with_seconds_loaded;
        }
        return this.load_seconds;
    };

    origin_format_value = instance.web.format_value;
    instance.web.format_value = function(value, descriptor, value_if_empty) {
        switch (descriptor.widget || descriptor.type || (descriptor.field && descriptor.field.type)) {
            case 'float_time':
                if (get_float_conf_value()) {
                    return instance.web.format_value(value, {type : "float_time_second"});
                } else {
                    return origin_format_value(value, descriptor, value_if_empty);
                }
            case 'float_time_second':
                var pattern = '%02d:%02d:%02d';
                if (value < 0) {
                    value = Math.abs(value);
                    pattern = '-' + pattern;
                }
                var hour = Math.floor(value);
                var min = Math.floor((value % 1) * 60);
                var sec = Math.round((((value % 1) * 60) % 1) * 60);
                if (sec == 60) {
                    sec = 0;
                    min = min + 1;
                }
                if (min == 60) {
                    min = 0;
                    hour = hour + 1;
                }
                return _.str.sprintf(pattern, hour, min, sec);
        }
        return origin_format_value(value, descriptor, value_if_empty);
    };

    origin_parse_value = instance.web.parse_value;
    instance.web.parse_value = function(value, descriptor, value_if_empty) {
        switch (descriptor.widget || descriptor.type || (descriptor.field && descriptor.field.type)) {
            case 'float_time':
                if (get_float_conf_value()) {
                    return instance.web.parse_value(value, {type : "float_time_second"});
                } else {
                    return origin_parse_value(value, descriptor, value_if_empty);
                }
            case 'float_time_second':
                var factor = 1;
                if (value[0] === '-') {
                    value = value.slice(1);
                    factor = -1;
                }
                var float_time_pair = value.split(":");
                if (float_time_pair.length === 2) {
                    return factor * instance.web.parse_value(value, {type : "float_time"});
                }
                if (float_time_pair.length != 3) {
                    return factor * instance.web.parse_value(value, {type : "float"});
                }
                var hours = instance.web.parse_value(float_time_pair[0], {type : "integer"});
                var minutes = instance.web.parse_value(float_time_pair[1], {type : "integer"});
                var seconds = instance.web.parse_value(float_time_pair[2], {type : "integer"});
                return factor * (hours + (minutes / 60) + (seconds / 3600));
        }
        return origin_parse_value(value, descriptor, value_if_empty);
    };

    instance.web.form.widgets = instance.web.form.widgets.extend({
        'float_time_second' : 'instance.web.form.FieldFloat',
    });

};
