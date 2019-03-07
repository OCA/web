/* global openerp, py, jQuery, _, _t, $ */

openerp.web_action_conditionable = function (instance) {
    'use strict';
    instance.web.View.include({
        /**
         * @override
         */
        is_action_enabled: function(action) {
            var attrs = this.fields_view.arch.attrs;
            if (action in attrs) {
                try {
                    return this._super(action);
                } catch(error) {
                    var expr = attrs[action];
                    var expression = py.parse(py.tokenize(expr));
                    var cxt = new instance.web.CompoundContext(
                        this.get_fields_values && !_.isEmpty(this.fields)
                            // We're on a form that has loaded its fields
                            ? this.get_fields_values()
                            // This always exists
                            : this.dataset.get_context().get_eval_context() ||
                        {}
                    ).eval();

                    if (_.isEmpty(cxt) &&
                        this instanceof instance.web.FormView
                    ) {
                        // Short circuit if there's nothing to eval for form
                        // views, as this is also called before any fields are
                        // loaded
                        return true;
                    }

                    this._is_action_enabled_eval_context(cxt);

                    return py.evaluate(expression, cxt).toJSON();
                }
            } else {
                return true;
            }
        },
        _is_action_enabled_eval_context: function(cxt) {
            cxt._group_refs = instance.session.group_refs;
            cxt._context = this.dataset.get_context().eval();
        },

    });
    instance.web.form.Many2ManyListView.include({
        is_action_enabled: function(action) {
            if (action in this.fields_view.arch.attrs) {
                return (new instance.web.View()).is_action_enabled.apply(
                    this, arguments
                );
            }
            return true;
        },
    });
    instance.web.FormView.include({
        init: function() {
            this._super.apply(this, arguments);
            this.on(
                'load_record', this, this._load_record_web_action_conditionable
            );
        },
        _load_record_web_action_conditionable: function() {
            var self = this;
            // Set correct classes
            this.$el.toggleClass(
                'oe_cannot_create', !this.is_action_enabled('create')
            );
            this.$el.toggleClass(
                'oe_cannot_edit', !this.is_action_enabled('edit')
            );
            this.$el.toggleClass(
                'oe_cannot_delete', !this.is_action_enabled('delete')
            );
            var $footer = this.$buttons.find('footer');
            this.$buttons = jQuery(
                instance.web.qweb.render('FormView.buttons', {'widget': this})
            );
            this.$buttons.append($footer);
            // Update buttons
            if (this.options.$buttons) {
                var $existing = this.options.$buttons.find('.oe_form_buttons');
                if ($existing.length) {
                    $existing.remove();
                    this.options.$buttons.append(this.$buttons);
                }
            } else {
                this.$('.oe_form_buttons').replaceWith(this.$buttons);
            }
            this.$buttons.on(
                'click', '.oe_form_button_create',
                this.guard_active(this.on_button_create)
            );
            this.$buttons.on(
                'click', '.oe_form_button_edit',
                this.guard_active(this.on_button_edit)
            );
            this.$buttons.on(
                'click', '.oe_form_button_save',
                this.guard_active(this.on_button_save)
            );
            this.$buttons.on(
                'click', '.oe_form_button_cancel',
                this.guard_active(this.on_button_cancel)
            );
            this.check_actual_mode();
            // Update sidebar menu
            if (this.sidebar) {
                this.sidebar.items.other = _.filter(
                    this.sidebar.items.other, function(item) {
                        return (
                            item.callback !== self.on_button_delete &&
                            item.callback !== self.on_button_duplicate
                        );
                    }
                );
                this.sidebar.add_items('other', _.compact([
                    self.is_action_enabled('delete') && {
                        label: _t('Delete'),
                        callback: self.on_button_delete,
                    },
                    self.is_action_enabled('create') && {
                        label: _t('Duplicate'),
                        callback: self.on_button_duplicate,
                    },
                ]));
            }
        },
    });
};
