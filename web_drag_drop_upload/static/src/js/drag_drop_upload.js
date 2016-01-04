openerp.web_drag_drop_upload = function (instance) {
    var rowCount = 0;
    var status = 0;

    _t = instance.web._t;

    /*
    *
    * Drag & Drop Upload for top sidebar menu
    *
    */

    instance.web.Sidebar.include({
        redraw: function(){
            var self = this;
            this._super(this);
            var obj = $('.oe_sidebar_add_attachment');
            obj.each(function(index, el){
                $(el).find('form.oe_form_binary_form')
                    .append('<div class="dropText">' + _t('Drop Files Here') + '</div>');

                $(el).append('<div id="status"></div>');

                $(el).on('dragenter', function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $(this).css('border', '2px dashed #7c7bad');
                });

                $(el).on('dragover', function(e){
                     e.stopPropagation();
                     e.preventDefault();
                });

                $(el).on('drop', function(e){
                     $(this).css('border', '2px dashed #7c7bad');
                     e.preventDefault();
                     var files = e.originalEvent.dataTransfer.files;
                     self.handleFile(files, el)
                });

                /*
                * If files dropped outside
                */
                $(document).on('dragenter', function(e){
                    e.stopPropagation();
                    e.preventDefault();
                });

                $(document).on('dragover', function(e){
                  e.stopPropagation();
                  e.preventDefault();
                  $(el).css('border', '2px dotted #7c7bad');
                });

                $(document).on('drop', function(e){
                    e.stopPropagation();
                    e.preventDefault();
                });
            });

            if(this.$el.parents('.modal-footer').length === 1){//if in modal
                this.$el.find('.oe_form_dropdown_section').each(function(){
                    var $list = $(this).find('ul');
                    $list.css('top','-'+($list.height()+10)+'px');
                    $(this).find('i').removeClass('fa-caret-down').addClass('fa-caret-up');
                });
            }
        },

        handleFile: function(files, el){
            var self = this;
            self.uCallback = $(el).find("input[name='callback']").val();
            var id = $(el).find("input[name='id']").val();
            var model = $(el).find("input[name='model']").val();

            for (var i = 0; i < files.length; i++){
                var formData = new FormData();
                formData.append('callback', self.uCallback);
                formData.append('model', model);
                formData.append('id', id);
                formData.append('ufile', files[i]);

                var sBar = new this.createStatusbar(el);
                sBar.setFileNameSize(files[i].name, files[i].size);
                this.sendToServer(formData, sBar);
            }
        },

        createStatusbar: function(el){
            rowCount++;
            this.rowNr = rowCount;
            var row = "odd";
            if(rowCount %2 == 0) row = "even";

            this.statusbar = $("<div class='statusbar "+ row + "' data-nr='"+ rowCount +"'></div>");
            this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
            this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
            this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
            this.abort = $("<div class='abort'>Abort</div>").appendTo(this.statusbar);
            $(el).find('#status').append(this.statusbar);

            this.setFileNameSize = function(name, size){
                var sizeStr = "";
                var sizeKB = size/1024;
                if(parseInt(sizeKB) > 1024){
                    var sizeMB = sizeKB/1024;
                    sizeStr = sizeMB.toFixed(2)+" MB";
                }else{
                    sizeStr = sizeKB.toFixed(2)+" KB";
                }
                this.filename.html(name);
                this.size.html(sizeStr);
            }

            this.setProgress = function(progress){
                var progressBarWidth = progress * this.progressBar.width() / 100;
                this.progressBar.find('div').animate({ width: progressBarWidth }, 10).html(progress + "% ");
                if(parseInt(progress) >= 100){
                    this.abort.hide();
                }
            }

            this.setAbort = function(jqxhr){
                var sb = this.statusbar;
                this.abort.click( function(){
                    jqxhr.abort();
                    sb.hide();
                });
            }
        },

        sendToServer: function(formData, sBar){
            var self = this;
            var uploadURL = "/ddup/binary/upload_attachment";
            var jqXHR = $.ajax({
                xhr: function(){
                    var xhrobj = $.ajaxSettings.xhr();
                    if (xhrobj.upload){
                        xhrobj.upload.addEventListener('progress', function(event){
                            var percent = 0;
                            var rowNr = [];
                            var position = event.loaded || event.position;
                            var total = event.total;

                            if (event.lengthComputable){
                                percent = Math.ceil(position / total * 100);
                            }

                            $('.oe_sidebar_add_attachment:visible').find('#status > .statusbar')
                                .each(function(index){
                                    rowNr[index] = $(this).data('nr');
                            });

                            if($.inArray(sBar.rowNr, rowNr) < 0){
                                $('.oe_sidebar_add_attachment:visible').find('#status')
                                    .append(sBar.statusbar);
                                sBar.abort.click(function(){
                                    jqXHR.abort();
                                    sBar.statusbar.hide();
                                });
                            }
                            sBar.setProgress(percent);
                        }, false);
                    }
                    return xhrobj;
                },
                url: uploadURL,
                type: "POST",
                cache: false,
                async: true,
                contentType: false,
                processData: false,
                data: formData,
            }).done(function(data, textStatus, jqXHR){
                $('#'+self.uCallback).contents().find("head").append(data);
                sBar.setProgress(100);
            });
            sBar.setAbort(jqXHR);
        },
    });


    /*
    *
    * Drag & Drop Upload Widget for use in your custom views.
    *
    * Example:
    * <field name="document" widget="dad_upload"/>
    *
    * */

    instance.dad_upload = {}
    instance.web.form.widgets.add('dad_upload', 'instance.dad_upload.DaDUploadFormWidget')

    instance.dad_upload.DaDUploadFormWidget = instance.web.form.FieldBinary.extend({
        template: 'DaDFieldBinaryFile',
        init: function(field_manager, node){
            this._super(field_manager, node);
            this.field_manager = field_manager;
            this.node = node;
            this.fileupload_id = _.uniqueId('oe_fileupload');
        },
        initialize_content: function() {
            var self = this;
            this._super();
            self.$el.css('border', '2px dotted #7c7bad');
            self.$el.css('background-color', '#ebebeb');
            this.$el.find('form.oe_form_binary_form').append('<div class="dropFiles">'
                + _t('Drop Files Here') + '</div>');
            this.$el.append('<div id="status"></div>');

            this.$el.on('dragenter', function(e){
                e.stopPropagation();
                e.preventDefault();
                $(this).css('border', '2px dashed #7c7bad');
            });

            this.$el.on('dragover', function(e){
                e.stopPropagation();
                e.preventDefault();
            });

            this.$el.on('drop', function(e){
                $(this).css('border', '2px dashed #7c7bad');
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                self.handleFile(files);
            });

            $(document).on('dragover', function(e){
                e.stopPropagation();
                e.preventDefault();
                self.$el.css('border', '2px dotted #7c7bad');
            });
        },
        handleFile: function(files){
            var self = this;
            callback = self.$el.find("input[name='callback']").val();
            var id = self.view.dataset.ids[0];
            var model = self.view.dataset.model;

            for (var i = 0; i < files.length; i++){
                var formData = new FormData();
                formData.append('ufile', files[i]);
                formData.append('callback', callback);
                formData.append('id', id);
                formData.append('model', model);
                var status = new this.createStatusbar(self.$el);
                status.setFileNameSize(files[i].name,files[i].size);
                this.sendToServer(formData, status);
            }
        },
        sendToServer: function(formData, status){
            self_view = this;
            var uploadURL = "/ddup/binary/upload_attachment";
            var jqXHR = $.ajax({
                xhr: function(){
                    var xhrobj = $.ajaxSettings.xhr();
                    if (xhrobj.upload){
                        xhrobj.upload.addEventListener('progress', function(event){
                            var percent = 0;
                            var rowNr = [];
                            var position = event.loaded || event.position;
                            var total = event.total;
                            if (event.lengthComputable){
                                percent = Math.ceil(position / total * 100);
                            }
                            $('.oe_sidebar_add_attachment:visible').find('#status > .statusbar')
                                .each(function(index){
                                    rowNr[index] = $(this).data('nr');
                            });
                            if($.inArray(status.rowNr, rowNr) < 0){
                                $('.oe_sidebar_add_attachment:visible').find('#status').append(status.statusbar);
                                status.abort.click( function(){
                                    jqXHR.abort();
                                    status.statusbar.hide();
                                });
                            }
                            status.setProgress(percent);
                        }, false);
                    }
                    return xhrobj;
                },
                url: uploadURL,
                type: "POST",
                contentType:false,
                processData: false,
                cache: false,
                data: formData,
            }).done(function(data){
                $('#'+callback).contents().find("head").append(data);
                status.setProgress(100);
                self_view.view.reload();
            });
            status.setAbort(jqXHR);
        },
        createStatusbar: function($el){
            rowCount++;
            this.rowNr = rowCount;
            var row="odd";
            if(rowCount %2 ==0) row ="even";
            this.statusbar = $("<div class='statusbarFiles "+ row + "' data-nr='"+ rowCount +"'></div>");
            this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
            this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
            this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
            this.abort = $("<div class='abort'>Abort</div>").appendTo(this.statusbar);
            $el.find('#status').append(this.statusbar);

            this.setFileNameSize = function(name, size){
                var sizeStr = "";
                var sizeKB = size/1024;
                if(parseInt(sizeKB) > 1024){
                    var sizeMB = sizeKB/1024;
                    sizeStr = sizeMB.toFixed(2)+" MB";
                }else{
                    sizeStr = sizeKB.toFixed(2)+" KB";
                }
                this.filename.html(name);
                this.size.html(sizeStr);
            }
            this.setProgress = function(progress){
                var progressBarWidth =progress*this.progressBar.width()/ 100;
                this.progressBar.find('div').animate({width: progressBarWidth}, 10).html(progress + "% ");
                if(parseInt(progress) >= 100){
                    this.abort.hide();
                }
            }
            this.setAbort = function(jqxhr){
                var sb = this.statusbar;
                this.abort.click(function(){
                    jqxhr.abort();
                    sb.hide();
                });
            }
        }
    })
};
