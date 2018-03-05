//-*- coding: utf-8 -*-
//Copyright 2018 Therp BV <https://therp.nl>
//License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

odoo.define('web_widget_many2one_polymorphic', function(require)
{
    var core = require('web.core'),
        form_relational = require('web.form_relational');

    var FieldMany2OnePolymorphic = form_relational.FieldMany2One.extend({
        init: function(field_manager, node) {
            var self = this;
            this._super.apply(this, arguments);
            // reset our value when the model field changes
            field_manager.on(
                _.str.sprintf('field_changed:%s', this.options.model_field),
                this,
                function() {
                    // TODO: this resets too early
                    //self.set_value(false);
                },
            )
            // pretend to have a field with a relation
            Object.defineProperty(
                this.field, 'relation', {
                    configurable: true,
                    get: function() {
                        return field_manager.get_field_value(
                            self.options.model_field
                        );
                    },
                }
            );
        },
    });

    core.form_widget_registry.add(
        'many2one_polymorphic', FieldMany2OnePolymorphic,
    )

    return {
        FieldMany2OnePolymorphic: FieldMany2OnePolymorphic,
    }
});
