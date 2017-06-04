.. image:: https://img.shields.io/badge/licence-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

=========================
Web Widget - Image WebCam
=========================

This module extends the functionality of the image widget and allows to take snapshots with WebCam.

Configuration
=============

By default, the module works with all `major browsers
<https://github.com/jhuckaby/webcamjs#browser-support>`_.

An important note for **Chrome 47+** users - this module only works with websites delivered over SSL / HTTPS.
Visit this for `more info
<https://github.com/jhuckaby/webcamjs#important-note-for-chrome-47>`_.

But, If you still want this module to work with websites without SSL / HTTPS.
Here is the steps to do it easily (Always run in Adobe Flash fallback mode, but it is not desirable).

Set the configuration parameter ``web_widget_image_webcam.flash_fallback_mode`` to ``1``

Its done! Now this module also work with websites without SSL / HTTPS.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Siddharth Bhalgami <siddharth.bhalgami@techreceptives.com>
* Kaushal Prajapati <kbprajapati@live.com>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
