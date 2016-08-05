openerp.web_widget_digitized_signature = function(instance) {
    "use strict";
    var _t = instance.web._t;
    var QWeb = instance.web.qweb;
    var images = {}

    instance.web.form.widgets.add('signature', 'instance.web.form.FieldSignature');
        instance.web.form.FieldSignature = instance.web.form.FieldBinaryImage.extend({
        template: 'FieldSignature',
        placeholder: "/web/static/src/img/placeholder.png",
        initialize_content: function() {
            this._super();
            this.$el.find("#signature").empty().jSignature({'decor-color' : '#D1D0CE', 'color': '#000', 'background-color': '#fff'});
            this.$el.find("#signature").attr({"tabindex": "0",'height':"100"});
            this.empty_sign = this.$el.find("#signature").jSignature("getData",'image');
            this.$el.find('#sign_clean').click(this.on_clear_sign);
            this.$el.find('.save_sign').click(this.on_save_sign);
        },
        on_clear_sign: function() {
            if (this.get('value') !== false) {
                this.binary_value = false;
                this.internal_set_value(false);
            }
            $(this.$el[0]).find(".signature > canvas").remove()
            $(this.$el[0]).find(".signature").attr("tabindex", "0");
            $(this.$el[0]).find(".signature").jSignature();
            $(this.$el[0]).find(".signature").focus()
            return false;
        },
        on_save_sign: function(value_) {
            var self = this;
            var val;
            var signature = self.$el.find("#signature").jSignature("getData",'image');
            var is_empty = signature ? self.empty_sign[1] == signature[1] : false;
            if(! is_empty && signature[1]){
                self.set('value',signature[1])
            }
        },
        render_value: function() {
            var self = this;
            var url;
            if (this.get('value') && !instance.web.form.is_bin_size(this.get('value'))) {
                url = 'data:image/png;base64,' + this.get('value');
            }else if (this.get('value')) {
                var id = JSON.stringify(this.view.datarecord.id || null);
                var field = this.name;
                if (this.options.preview_image)
                    field = this.options.preview_image;
                url = this.session.url('/web/binary/image', {
                          model: this.view.dataset.model,
                          id: id,
                          field: field,
                          t: (new Date().getTime()),
                });
            }else if(! this.get('value')){
                $(this.$el[0]).find(".signature > canvas").remove();
                var sign_options = {'decor-color' : '#D1D0CE', 'color': '#000', 'background-color': '#fff'};

                if ('width' in self.node.attrs){
                    sign_options.width = self.node.attrs.width;
                }
                if ('height' in self.node.attrs){
                    sign_options.height = self.node.attrs.height;
                }
                this.$el.find("#signature").empty().jSignature(sign_options);
                this.$el.find("#signature").attr({"tabindex": "0",'height':"100"});
            }else {
                url = this.placeholder;
            }
            if(this.view.get("actual_mode") == 'view'){
                var $img = $(QWeb.render("FieldBinaryImage-img", { widget: this, url: url }));
                this.$el.find('> img').remove();
                this.$el.find("#signature").hide();
                this.$el.prepend($img);
                $img.load(function() {
                    if (! self.options.size)
                        return;
                    $img.css("max-width", "" + self.options.size[0] + "px");
                    $img.css("max-height", "" + self.options.size[1] + "px");
                    $img.css("margin-left", "" + (self.options.size[0] - $img.width()) / 2 + "px");
                    $img.css("margin-top", "" + (self.options.size[1] - $img.height()) / 2 + "px");
                });
                $img.on('error', function() {
                    $img.attr('src', self.placeholder);
                    instance.webclient.notification.warn(_t("Image"), _t("Could not display the selected image."));
                });
            }else if(this.view.get("actual_mode") == 'edit' || this.view.get("actual_mode") == 'create'){
                this.$el.find('> img').remove();
                if(this.get('value')){
                    var id = JSON.stringify(this.view.datarecord.id || null);
                    var field = this.name;
                    if (this.options.preview_image)
                        field = this.options.preview_image;
                    new instance.web.Model(this.view.dataset.model).call("read", [this.view.datarecord.id, [field]]).done(function(data) {
                        if(data){
                            var field_desc = _.values(_.pick(data, field));
                            $(self.$el[0]).find(".signature").jSignature('reset');
                            $(self.$el[0]).find(".signature").jSignature("setData", 'data:image/png;base64,'+field_desc[0]);
                        }
                    });
                }
          }
        },
    });
        instance.web.FormView.include({
            save: function() {
                this.$el.find('.save_sign').click();
                return this._super.apply(this, arguments);
            },
        })
}
