odoo.define('survey.survey', function (require) {
'use strict';

var website = require('website.website');

/*
 * This file is intended to add interactivity to survey forms rendered by
 * the website engine.
 */

var the_form = $('.js_surveyform');

if(!the_form.length) {
    return $.Deferred().reject("DOM doesn't contain '.js_surveyform'");
}

    console.debug("[survey] Custom JS for survey is loading...");

    var prefill_controller = the_form.attr("data-prefill");
    var submit_controller = the_form.attr("data-submit");
    var scores_controller = the_form.attr("data-scores");
    var print_mode = false;
    var quiz_correction_mode = false;

    // Printing mode: will disable all the controls in the form
    if (_.isUndefined(submit_controller)) {
        $(".js_surveyform .input-group-addon span.fa-calendar").css("pointer-events", "none");
        $('.js_surveyform :input').prop('disabled', true);
        $('.file_upload').remove();
        $('.o_clear_file_button').remove();
        print_mode = true;
    }

    // Quiz correction mode
    if (! _.isUndefined(scores_controller)) {
        quiz_correction_mode = true;
    }

    $("div.input-group span.fa-calendar").on('click', function(e) {
        $(e.currentTarget).closest("div.date").datetimepicker({
            useSeconds: true,
            icons : {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down'
            },
        });
    });

    // Custom code for right behavior of radio buttons with comments box
    $('.js_comments>input[type="text"]').focusin(function(){
        $(this).prev().find('>input').attr("checked","checked");
    });
    $('.js_radio input[type="radio"][data-oe-survey-otherr!="1"]').click(function(){
        $(this).closest('.js_radio').find('.js_comments>input[type="text"]').val("");
    });
    $('.js_comments input[type="radio"]').click(function(){
        $(this).closest('.js_comments').find('>input[data-oe-survey-othert="1"]').focus();
    });
    // Custom code for right behavior of dropdown menu with comments
    $('.js_drop input[data-oe-survey-othert="1"]').hide();
    $('.js_drop select').change(function(){
        var other_val = $(this).find('.js_other_option').val();
        if($(this).val() === other_val){
            $(this).parent().removeClass('col-md-12').addClass('col-md-6');
            $(this).closest('.js_drop').find('input[data-oe-survey-othert="1"]').show().focus();
        }
        else{
            $(this).parent().removeClass('col-md-6').addClass('col-md-12');
            $(this).closest('.js_drop').find('input[data-oe-survey-othert="1"]').val("").hide();
        }
    });
    // Custom code for right behavior of checkboxes with comments box
    $('.js_ck_comments>input[type="text"]').focusin(function(){
        $(this).prev().find('>input').attr("checked","checked");
    });
    $('.js_ck_comments input[type="checkbox"]').change(function(){
        if (! $(this).prop("checked")){
            $(this).closest('.js_ck_comments').find('input[type="text"]').val("");
        }
    });

    $('.file_upload').change(function(){
        readURL(this)
    });

    $('.o_clear_file_button').click(function(){
        $(this).parent().find('> img').remove();
        $(this).parent().find('>input:hidden').remove();
        $(this).parent().find('> input:file').val("")
    });

    $('.o_reference').change(function(){     //auto calculate base on formula
        var ref_key = $(this).attr('reference')
        var ref_value = $(this).val()
        $(".o_reference[reference*="+ ref_key + "][reference^='='").each(function(){  //partial attribute value filter
            var ref_key_value = {}
             if (! _.isUndefined($(this).data('ref_key_value'))) {  //referred key value pair , "a":1,"b":2
                ref_key_value = $(this).data('ref_key_value')   // data instead of attr to store array
             }
            var ref_key_count = $(this).attr('ref_key_count')   //
            if (! ref_key_value.hasOwnProperty(ref_key)){
               ref_key_count = ref_key_count - 1
            }
            ref_key_value[ref_key] = ref_value
            $(this).data('ref_key_value', ref_key_value)
            $(this).attr('ref_key_count', ref_key_count)
            if (ref_key_count <=0){
                var reference = $(this).attr('reference')
                Object.keys(ref_key_value).forEach(function(key){
                    var regex = new RegExp(key, 'gi')     // to global replace by replace(/a/g,'value)
                    reference = reference.replace(regex,ref_key_value[key])   // /old/g does not work here
                    console.log(key +":" + ref_key_value[key])
                    })
                reference = reference.replace("=", "")
                $(this).val(eval(reference))
                $(this).prop('readonly', true);  //disabled input will not be submitted
            }
        })
    });

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = (function(input){
                return function (e) {
                    var $img = $('<img>').attr('src', e.target.result);
                     $(input).parent().find('> img').remove();
                     $(input).parent().prepend($img); //
                     //$('#blah').attr('src', e.target.result);
                }
             })(input)
            reader.readAsDataURL(input.files[0]);
        }
    }
    // Pre-filling of the form with previous answers
    function prefill(){
        if (! _.isUndefined(prefill_controller)) {
            var prefill_def = $.ajax(prefill_controller, {dataType: "json"})
                .done(function(json_data){
                    _.each(json_data, function(value, key){
                        //<img src="data:image/gif;base64,xxxxxxxxxxxxx...">
                        the_form.find("div[name=" + key + "]").each(function(){
                            var url = "data:image/png;base64," + value
                            var $img = $('<img>').attr('src', url);
                            var $img_input = $('<input>').attr('type', 'hidden');
                            $img_input.attr('name', key+"_image")
                            $(this).find('> img').remove();
                            $(this).prepend($img); // remove & prepend instead of change src attr which cause chrome error
                            $(this).prepend($img_input)
                            console.log("key:"+key)
                        });
                        // prefill of text/number/date boxes
                        var input = the_form.find(".form-control[name=" + key + "]");
                        input.val(value);

                        // special case for comments under multiple suggestions questions
                        if (_.string.endsWith(key, "_comment") &&
                            (input.parent().hasClass("js_comments") || input.parent().hasClass("js_ck_comments"))) {
                            input.siblings().find('>input').attr("checked","checked");
                        }
                        // checkboxes and radios
                        //the_form.find("input[name^=" + key + "][type!='text']").each(function(){
                        the_form.find("input[name^=" + key + "][type!='file']").each(function(){
                            $(this).val(value);
                        });
                    });
                })
                .fail(function(){
                    console.warn("[survey] Unable to load prefill data");
                });
            return prefill_def;
        }
    }

    // Display score if quiz correction mode
    function display_scores(){
        if (! _.isUndefined(scores_controller)) {
            var score_def = $.ajax(scores_controller, {dataType: "json"})
                .done(function(json_data){
                    _.each(json_data, function(value, key){
                        the_form.find("span[data-score-question=" + key + "]").text("Your score: " + value);
                    });
                })
                .fail(function(){
                    console.warn("[survey] Unable to load score data");
                });
            return score_def;
        }
    }

    // Parameters for form submission
    $('.js_surveyform').ajaxForm({
        url: submit_controller,
        type: 'POST',                       // submission type
        dataType: 'json',                   // answer expected type
        beforeSubmit: function(){           // hide previous errmsg before resubmitting
            $('.js_errzone').html("").hide();
        },
        success: function(response, status, xhr, wfe){ // submission attempt
            if(_.has(response, 'errors')){  // some questions have errors
                _.each(_.keys(response.errors), function(key){
                    $("#" + key + '>.js_errzone').append('<p>' + response.errors[key] + '</p>').show();
                });
                return false;
            }
            else if (_.has(response, 'redirect')){      // form is ok
                window.location.replace(response.redirect);
                return true;
            }
            else {                                      // server sends bad data
                console.error("Incorrect answer sent by server");
                return false;
            }
        },
        timeout: 5000,
        error: function(jqXHR, textStatus, errorThrown){ // failure of AJAX request
            $('#AJAXErrorModal').modal('show');
        }
    });

    // // Handles the event when a question is focused out
    // $('.js_question-wrapper').focusout(
    //     function(){
    //         console.debug("[survey] Focus lost on question " + $(this).attr("id"));
    // });

    // Launch prefilling
    prefill();
    if(quiz_correction_mode === true){
        display_scores();
    }

    console.debug("[survey] Custom JS for survey loaded!");

});
