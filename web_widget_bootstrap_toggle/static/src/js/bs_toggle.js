openerp.web_widget_bootstrap_toggle = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

local.FieldBooleanToggle = instance.web.form.AbstractField.extend({
    template: 'FieldBooleanToggle',
    start: function() {
        var self = this;
        this.$checkbox = $("input", this.$el);
        this.setupFocus(this.$checkbox);
        this.$el.click(_.bind(function() {
            this.$checkbox.bootstrapToggle('toggle');
            this.internal_set_value(this.$checkbox.is(':checked'));
        }, this));
        var check_readonly = function() {
            self.$checkbox.prop('disabled', self.get("effective_readonly"));
            self.click_disabled_boolean();
        };
        this.on("change:effective_readonly", this, check_readonly);
        check_readonly.call(this);
        this._super.apply(this, arguments);
    },
    render_value: function() {
        this.$checkbox[0].checked = this.get('value');
        var toggle_options = {};
        if (typeof this.options['data-on'] !== "undefined"){
            toggle_options.on = this.options['data-on'];
        }
        if (typeof this.options['data-off'] !== "undefined"){
            toggle_options.off = this.options['data-off'];
        }
        if (typeof this.options['data-size'] !== "undefined"){
            toggle_options.size = this.options['data-size'];
        }
        if (typeof this.options['data-width'] !== "undefined"){
            toggle_options.width = this.options['data-width'];
        }
        if (typeof this.options['data-height'] !== "undefined"){
            toggle_options.height = this.options['data-height'];
        }
        if (typeof this.options['data-onstyle'] !== "undefined"){
            toggle_options.onstyle = this.options['data-onstyle'];
        }
        if (typeof this.options['data-offstyle'] !== "undefined"){
            toggle_options.offstyle = this.options['data-offstyle'];
        }
        if (typeof this.options['data-style'] !== "undefined"){
            toggle_options.style = this.options['data-style'];
        }

        if (this.get('value')){
            this.$checkbox.bootstrapToggle(toggle_options);
            this.$checkbox.bootstrapToggle('on');
        } else {
            this.$checkbox.bootstrapToggle(toggle_options);
            this.$checkbox.bootstrapToggle('off');
            
        }
    },
    focus: function() {
        var input = this.$checkbox && this.$checkbox[0];
        return input ? input.focus() : false;
    },
    click_disabled_boolean: function(){
        var $disabled = this.$el.find('input[type=checkbox]:disabled');
        $disabled.each(function (){
            $(this).next('div').remove();
            $(this).closest("span").append($('<div class="boolean"></div>'));
        });
    }
});
instance.web.form.widgets.add('boolean_switch','instance.web_widget_bootstrap_toggle.FieldBooleanToggle');
}
