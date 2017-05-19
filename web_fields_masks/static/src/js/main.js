openerp.web_fields_masks = function (instance) {
    instance.web.form.FieldChar.include({
        mask: '',
        init: function(field_manager, node) {
            this._super(field_manager, node);
            if (_.has(this.node.attrs, 'data-inputmask')) {
                this.mask = this.node.attrs['data-inputmask'];
            }
        },

        render_value: function () {
            var self = this;
            this._super();
            if (this.mask !== '') {
                this.$('input').attr('data-inputmask', this.mask);
                this.$('input').inputmask(undefined, {
                    onincomplete: function () {
                        self.$el.addClass('oe_form_invalid');
                    },
                    oncomplete: function () {
                        self.$el.removeClass('oe_form_invalid');
                    },
                });
            }
        },
    });
}
