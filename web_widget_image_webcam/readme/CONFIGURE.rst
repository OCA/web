By default, the module works with all `major browsers
<https://github.com/jhuckaby/webcamjs/blob/master/DOCS.md#browser-support>`_.

An important note for **Chrome 47+** users - this module only works with websites delivered over SSL / HTTPS.
Visit this for `more info
<https://github.com/jhuckaby/webcamjs/blob/master/DOCS.md#important-note-for-chrome-47>`_.

But, If you still want this module to work with websites without SSL / HTTPS.
Here is the steps to do it easily (Always run in Adobe Flash fallback mode, but it is not desirable).

Set the configuration parameter ``web_widget_image_webcam.flash_fallback_mode`` to ``1``

Its done! Now this module also work with websites without SSL / HTTPS.
