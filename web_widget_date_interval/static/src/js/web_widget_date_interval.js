//-*- coding: utf-8 -*-
//Copyright 2018 Therp BV <https://therp.nl>
//License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

odoo.define('web_widget_date_interval', function(require) {
    var core = require('web.core'),
        pyeval = require('web.pyeval'),
        Widget = require('web.Widget'),
        SearchView = require('web.SearchView');

    var SearchWidgetDateInterval = Widget.extend({
        template: 'SearchView.DateInterval',
        events: {
            'click [data-id]': 'on_click_interval',
        },
        _option_defaults: {
            iso_week: {
                lookbehind: 1,
                lookahead: 10,
                exclusive: false,
                cycle: false,
            },
        },
        options: {
            type: 'iso_week',
            dropdown: true,
        },
        init: function(parent, field_name, string, options) {
            this.searchview = parent;
            this.string = string;
            this.options = _.extend(
                {}, this.options, this._option_defaults[options.type] || {},
                options
            );
            this.field = field_name;
            return this._super.apply(this, arguments);
        },
        start: function() {
            this.searchview.query.on(
                'add change remove reset', this.proxy('on_searchview_change')
            );
            return this._super.apply(this, arguments);
        },
        get_intervals: function() {
            var interval_function = _.str.sprintf(
                'get_intervals_%s', this.options.type
            );
            if(!this[interval_function]) {
                throw new Error('Unknown interval type given');
            }
            return this[interval_function]();
        },
        get_intervals_iso_week: function() {
            var existing = this.searchview.query.findWhere({
                    category: this.string,
                }),
                reference_date = moment(
                    !existing || !this.options.cycle
                    ? this.options.date
                    : existing.get('field').get_domain().slice(-2, -1)[0][2]
                ),
                start_date = reference_date.clone().startOf('isoWeek')
                .subtract(this.options.lookbehind, 'weeks'),
                stop_date = reference_date.clone().endOf('isoWeek')
                .add(this.options.lookahead, 'weeks'),
                current_date = start_date.clone(),
                result = [];

            while(current_date.isBefore(stop_date)) {
                result.push({
                    name: current_date.year() === moment().year()
                    ? _.str.sprintf(core._t('%s'), current_date.isoWeek())
                    : _.str.sprintf(
                        core._t('%s / %s'), current_date.isoWeek(),
                        current_date.isoWeekYear()
                    ),
                    _id: _.str.sprintf(
                        '%s-%s', this.field, current_date.format('YYYY-MM-DD')
                    ),
                    start: current_date.format('YYYY-MM-DD'),
                    stop: current_date.add(1, 'weeks').format('YYYY-MM-DD'),
                });
            }
            return result;
        },
        on_click_interval: function(e) {
            var $this = jQuery(e.currentTarget);
            return this._update_searchview(
                $this.data('start'), $this.data('stop'), $this.text().trim()
            );
        },
        _create_facet: function(date_start, date_stop, label) {
            var self = this;

            return {
                field: {
                    get_domain: function() {
                        return [
                            '&',
                            [self.field, '>=', date_start],
                            [self.field, '<', date_stop],
                        ];
                    },
                    // eslint-disable-next-line no-empty-function
                    get_context: function() {},
                    // eslint-disable-next-line no-empty-function
                    get_groupby: function() {},
                },
                category: this.string,
                icon: 'fa-calendar',
                values: [
                    {
                        label: _.str.sprintf(
                            '%s: %s', this.string, label
                        ),
                        value: null,
                    },
                ],
                _id: _.str.sprintf(
                    '%s-%s', self.field, date_start
                ),
            };
        },
        _update_searchview: function(date_start, date_stop, label, options) {
            var facet = this._create_facet(date_start, date_stop, label),
                existing = this.searchview.query.findWhere({
                    category: this.string,
                });
            if(existing) {
                var is_removal = existing.get('_id').includes(facet._id);

                this.searchview.query.remove(existing, {silent: !is_removal});

                if(!this.options.exclusive) {
                    // concatenate existing facet with ours
                    var domain = [].concat(
                        ['|'], facet.field.get_domain(),
                        existing.get('field').get_domain()
                    );
                    facet._id = _.str.sprintf(
                        '%s %s', facet._id, existing.get('_id')
                    );
                    facet.values = facet.values.concat(existing.get('values'));
                    facet.field.get_domain = function() {
                        return domain;
                    };
                }

                if(is_removal) {
                    return;
                }
            }
            this.searchview.query.add(facet, options);
        },
        on_searchview_change: function() {
            var self = this;
            this.$('[data-id]').removeClass('selected');
            if(this.options.cycle) {
                this.renderElement();
            }
            this.searchview.query.each(function(facet) {
                if(facet.get('category') === self.string) {
                    self.$(
                        _.map(
                            facet.get('_id').split(' '), function(x) {
                                return _.str.sprintf('[data-id="%s"]', x);
                            }
                        ).join(',')
                    ).addClass('selected');
                }
            });
        },
        facet_for_defaults: function(values) {
            var self = this,
                default_value = values[_.str.sprintf(
                    'date_interval_%s', this.field
                )],
                facet = false;

            if(!default_value) {
                return;
            }

            default_value = moment(default_value);

            _(this.get_intervals()).each(function(interval) {
                if(
                    !moment(interval.start).isBefore(default_value) ||
                    !moment(interval.stop).isAfter(default_value)
                ) {
                    return;
                }
                facet = self._create_facet(
                    interval.start, interval.stop, interval.name
                );
            });
            return facet;
        },
        visible: function() {
            return false;
        },
    });

    SearchView.include({
        init: function() {
            this._super.apply(this, arguments);
            this.date_intervals = [];
        },
        start: function() {
            var self = this,
                deferreds = [this._super.apply(this, arguments)];

            if(this.$buttons && !this.options.disable_date_interval) {
                _(this.date_intervals).each(function(widget) {
                    deferreds.push(widget.appendTo(self.$buttons));
                });
            }

            return jQuery.when.apply(jQuery, deferreds);
        },
        prepare_search_inputs: function() {
            this._super.apply(this, arguments);

            var self = this;

            _.chain(this.fields_view.arch.children)
            .filter(function(x) {
                return x.tag === 'field' && x.attrs.widget === 'date_interval';
            })
            .each(function(x) {
                var widget = new SearchWidgetDateInterval(
                    self, x.attrs.name, core._t(x.attrs.string) ||
                    self.ViewManager.search_fields_view.fields[x.attrs.name]
                    .string, pyeval.py_eval(x.attrs.options || '{}')
                );
                self.date_intervals.push(widget);
                self.search_fields.push(widget);
            });
        },
    });

    return {
        search_widget_date_interval: SearchWidgetDateInterval,
    };
});
