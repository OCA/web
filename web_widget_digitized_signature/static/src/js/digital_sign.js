openerp.web_widget_digitized_signature = function(instance) {
    "use strict";
    var _t = instance.web._t;
    var QWeb = instance.web.qweb;
    var images = {}

    instance.web.form.widgets.add('signature', 'instance.web.form.FieldSignature');
        instance.web.form.FieldSignature = instance.web.form.FieldBinaryImage.extend({
        template: 'FieldSignature',
        render_value: function() {
            var self = this;
            var url;
            if (this.get('value') && !instance.web.form.is_bin_size(this.get('value'))) {
                url = 'data:image/png;base64,' + this.get('value');
            }else if (this.get('value')) {
                var id = JSON.stringify(this.view.datarecord.id || null);
                self.digita_dataset = new instance.web.DataSetSearch(self, self.view.model, {}, []);
                self.digita_dataset.read_slice(['id', self.name], {'domain': [['id', '=', id]]}).then(function(records){
                    _.each(records,function(record){
                        if(record[self.name]){
                            images[self.name] = record[self.name]
                        }else{
                            images[self.name] = ""
                        }
                    })
                })
                var field = this.name;
                if (this.options.preview_image)
                    field = this.options.preview_image;
                url = this.session.url('/web/binary/image', {
                          model: this.view.dataset.model,
                          id: id,
                          field: field,
                          t: (new Date().getTime()),
                });
            }else {
                images[self.name] = ""
                url = this.placeholder;
                self.set('value',images[self.name])
            }
            var $img = $(QWeb.render("FieldBinaryImage-img", { widget: this, url: url }));
            this.$el.find('img').remove();
            var sign_options = {};
            if ('width' in self.node.attrs){
                sign_options.width = self.node.attrs.width;
            }
            if ('height' in self.node.attrs){
                sign_options.height = self.node.attrs.height;
            }
            var actual_mode = this.view.get("actual_mode");
            if(actual_mode !== 'edit' && actual_mode !== 'create'){
                this.$el.prepend($img);
            }else if(actual_mode == 'edit' || actual_mode == 'create'){
                if( actual_mode == 'create'){
                    images = {};
                }
                this.$el.find('> img').remove();
                this.$el.find('> canvas').remove();
                if(! this.get('value')){
                    this.$el.find('> img').remove();
                    this.$el.find(".signature").signature(sign_options);
                }else if(this.get('value')){
                    this.$el.prepend($img);
                }
            }
            this.$el.find('.clear_sign').click(function(){
                self.$el.find('> img').remove();
                images[self.name] = ""
                self.$el.find(".signature").show();
                self.$el.find(".signature").signature('clear');
            });
            $('.save_sign').click(function(){
                var val
                if(self.$el.find(".signature").hasClass( "kbw-signature" ) && ! self.$el.find(".signature").signature('isEmpty')){
                    self.$el.find(".signature").hide();
                    val = self.$el.find(".signature > canvas")[0].toDataURL();
                    images[self.name] = val.split(',')[1]
                    var $img = $(QWeb.render("FieldBinaryImage-signature", { widget: self, url: val }));
                    self.$el.find('> img').remove();
                    self.$el.prepend($img);
                    self.set('value',val.split(',')[1])
                    var id = JSON.stringify(self.view.datarecord.id || null);
                    var field = self.name;
                    url = self.session.url('/web/binary/image', {
                        model: self.view.dataset.model,
                        id: id,
                        field: field,
                        t: (new Date().getTime()),
                    });
                }else{
                        var id = JSON.stringify(self.view.datarecord.id || null);
                        var field = self.name;
                        if (self.options.preview_image)
                            field = self.options.preview_image;
                        url = self.session.url('/web/binary/image', {
                                model: self.view.dataset.model,
                                id: id,
                                field: field,
                                t: (new Date().getTime()),
                        });
                       var $img = $(QWeb.render("FieldBinaryImage-signature", { widget: self, url: url }));
                       self.$el.find('> img').remove();
                }
            });
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
        },
    });
    instance.web.FormView.include({
        save: function() {
            $('.save_sign').click();
            return this._super.apply(this, arguments);
        },
    })
}
