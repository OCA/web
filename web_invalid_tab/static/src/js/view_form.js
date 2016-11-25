odoo.define('web_invalid_tab.invalid_tab', function(require){
    'use strict';

    var FormView = require('web.FormView');
    var form_common = require('web.form_common');

    var tab_selector = 'div[role="tabpanel"]';

    function tab_link(tab) {
        return $("a[href='#" + tab.attr('id') + "']");
    }

    function is_visible(tab, element) {
        if ($(element).hasClass('oe_form_invisible') || element.style.display == 'none') {
            return false;
        }
        else if (element.parentNode && element.parentNode != tab) {
            return is_visible(tab, element.parentNode);
        }
        else {
            return true;
        }
    }

    form_common.AbstractField.include({
        _check_css_flags: function() {
            if (this.field.translate) {
                this.$el.find('.oe_field_translate').toggle(this.field_manager.get('actual_mode') !== "create");
            }
            if (!this.disable_utility_classes) {
                if (this.field_manager.get('display_invalid_fields')) {
                    this.$el.toggleClass('oe_form_invalid', !this.is_valid());
                    this._update_tab_invalid_class();
                }
            }
        },
        _update_tab_invalid_class: function() {
            var tab = this.$el.closest(tab_selector);
            if (tab.attr('id')) {
                if (this.is_valid()) {
                    if (tab.find('.oe_form_invalid').length == 0) {
                        tab_link(tab).removeClass('oe_form_tab_invalid');
                    }
                }
                else if (is_visible(tab.get(0), this.$el.get(0)) === true) {
                    tab_link(tab).addClass('oe_form_tab_invalid');
                }
            }
        }
    });

    FormView.include({
        on_form_changed: function() {
            this._super();
            $(tab_selector).each(function(i, tab) {
                var invalid = _.detect($(tab).find('.oe_form_invalid'), function(x) {
                    return is_visible(tab, x);
                });
                if (!invalid) {
                    tab_link($(tab)).removeClass('oe_form_tab_invalid');
                }
            });
        },
    });

});
