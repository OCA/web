openerp.web_digital_sign = function(instance) {
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
            if(this.view.get("actual_mode") !== 'edit' && this.view.get("actual_mode") !== 'create'){
                this.$el.prepend($img);
            }else if(this.view.get("actual_mode") == 'edit' ){
                this.$el.find('> img').remove();
                this.$el.find('> canvas').remove();
                if(! this.get('value')){
                    this.$el.find('> img').remove();
                    $(this.$el[0]).find(".signature").signature();
                }else if(this.get('value')){
                    this.$el.prepend($img);
                }
            }else if( this.view.get("actual_mode") == 'create'){
                images = {}
                this.$el.find('> img').remove();
                this.$el.find('> canvas').remove();
                if(! this.get('value')){
                    this.$el.find('> img').remove();
                    $(this.$el[0]).find(".signature").signature();
                }else if(this.get('value')){
                    this.$el.prepend($img);
                }
            }
            $(this.$el[0]).find('.clear_sign').click(function(){
                self.$el.find('> img').remove();
                images[self.name] = ""
                $(self.$el[0]).find(".signature").show();
                $(self.$el[0]).find(".signature").signature('clear');
            });
            $('.save_sign').click(function(){
                var val
                if($(self.$el[0]).find(".signature").hasClass( "kbw-signature" ) && ! $(self.$el[0]).find(".signature").signature('isEmpty')){
                    $(self.$el[0]).find(".signature").hide();
                    val = $(self.$el[0]).find(".signature > canvas")[0].toDataURL();
                    images[self.name] = val.split(',')[1]
                    var $img = $(QWeb.render("FieldBinaryImage-extend", { widget: self, url: val }));
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
                       var $img = $(QWeb.render("FieldBinaryImage-extend", { widget: self, url: url }));
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
        save: function(prepend_on_create) {
            var self = this;
            $('.save_sign').click()
            var save_obj = {prepend_on_create: prepend_on_create, ret: null};
            this.save_list.push(save_obj);
            return this._process_operations().then(function() {
                if (save_obj.error)
                    return $.Deferred().reject();
                return $.when.apply($, save_obj.ret);
            }).done(function() {
                self.$el.removeClass('oe_form_dirty');
            });
        },
    })
}
