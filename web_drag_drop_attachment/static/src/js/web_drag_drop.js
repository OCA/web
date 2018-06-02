odoo.define('web_drag_drop_attachment.web_drag_drop_attachment', function(require) {
    "use strict";

    var FormView = require('web.FormView');

    //Formview
    FormView.include({
        start: function() {
            var self = this;
            this._super.apply(this, arguments);
            if(self.get("actual_mode") === "view") {
                var isAdvancedUpload = function() {
                    var div = document.createElement('div');
                    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
                }();
                if (isAdvancedUpload) {
                    var str = '<div class="box" align="center">'+
                              '<div class="box__input">'+
                                  '<i class="fa fa-clipboard fa-4x" aria-hidden="true"></i>'+
                                  '<h3><span class="box__dragndrop">Drag it here</span>.</h4>'+
                              '</div>'+
                              '<div class="box__uploading">Uploading</div>'+
                              '<div class="box__success">Done! Upload more</div>'+
                              '<div class="box__error">Error! <span></span>. </div>'+
                              '</div>';
                    self.$el.prepend(str);
                    var $form = self.$el.parent().find(".box"),
                        $errorMsg = $form.find( '.box__error span' ),
                        $restart = $form.find( '.box__restart' );
                    $(document)
                    .on('dragbetterenter', function() {
                        if (self.get("actual_mode") === "view") {
                            $form.removeClass('is-error');
                            $form.addClass('has-advanced-upload');
                        }
                    })
                    .on('dragbetterleave', function() {
                        $form.removeClass('has-advanced-upload');
                    })
                    .on('drop', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });

                    $form
                    .on('dragover', function(e) {
                        e.preventDefault();
                        $form.addClass('is-dragover');
                        $form.find('.box__dragndrop').text("Drag & Drop your file here...");
                    })
                    .on('dragleave drop', function() {
                        $form.removeClass('is-dragover');
                        $form.find('.box__dragndrop').text("Drag your file to this green box...");
                    })
                    .on('drop', function(e) {
                        $form.addClass('is-uploading').removeClass('is-error');
                        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
                            _.each(e.originalEvent.dataTransfer.files, function(file) {
                                var fd = new FormData();
                                fd.append("model", self.dataset.model);
                                fd.append("id", self.datarecord.id);
                                fd.append("ufile", file);
                                if(self.datarecord.job_id) fd.append("job_id", self.datarecord.job_id[0]);
                                $.blockUI();
                                $.ajax({
                                    url: "/upload_attachment",
                                    type: "POST",
                                    data: fd,
                                    dataType: 'json',
                                    cache: false,
                                    contentType: false,
                                    processData: false,
                                    complete: function(data) {
                                        $form.removeClass('is-uploading');
                                        $form.addClass(data.success == true ? 'is-success' : 'is-error');
                                        if (!data.success) $errorMsg.text(data.error_msg);
                                    },
                                    success: function(data) {
                                        $.unblockUI();
                                        self.reload();
                                        $form.removeClass('has-advanced-upload');
                                    },
                                    error: function() {
                                        $.unblockUI();
                                        // Log the error, show an alert, whatever works for you
                                        alert("Error while uploading attachment.");
                                        $form.removeClass('has-advanced-upload');
                                    }
                                });
                            });
                        }
                    });
                }
            }
        },
    });

});
