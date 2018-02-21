(function() {
  'use strict';
  jQuery(document).ready(function($) {
    var init, makeContainer, makeId, match;
    makeId = function() {
      var i, opt, str;
      str = "";
      opt = "abcdefghijklmnopqrstuvwxyz";
      i = 1;
      while (i < 16) {
        str += opt.charAt(Math.floor(Math.random() * opt.length));
        i++;
      }
      return 'editor-' + str;
    };
    makeContainer = function($el) {
      var $nu, id;
      id = makeId();
      $nu = $('<div id="' + id + '"></div>');
      $el.after($nu);
      return $nu;
    };
    match = function($textarea, $editor, editor) {
      var height, id;
      id = $editor.attr('id');
      height = editor.getSession().getScreenLength() * editor.renderer.lineHeight;
      $textarea.val(editor.getValue());
      $('#' + id).css({
        height: height
      });
      $('#' + id + '-section').css({
        height: height
      });
      editor.resize();
    };
    init = function(options) {
      var $container, $editor, $textarea, editor, id;
      $textarea = options.textarea;
      $textarea.css({
        display: 'none'
      });
      $container = makeContainer($textarea);
      id = $container.attr('id');
      editor = ace.edit(id);
      $editor = $('#' + id);
      $editor.css({
        'margin-bottom': 30,
        'max-width': 800
      });
      editor.setTheme(options.theme);
      editor.getSession().setUseWrapMode(true);
      editor.getSession().setMode(options.mode);
      editor.setFontSize(16);
      editor.setValue($textarea.val(), -1);
      editor.on('change', function() {
        return match($textarea, $editor, editor);
      });
      match($textarea, $editor, editor);
      $('body').click;
      return editor;
    };
    return $.fn.asAceEditor = function(params) {
      var $t, defaults, options;
      $t = $(this).eq(0);
      if ($t.prop("tagName") !== "TEXTAREA") {
        return false;
      }
      defaults = {
        textarea: $t,
        theme: 'ace/theme/clouds',
        mode: 'ace/mode/markdown'
      };
      options = $.extend(defaults, params);
      $t.data("ace-editor", init(options));
      return this;
    };
  });

}).call(this);
