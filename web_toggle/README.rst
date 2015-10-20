.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

Boolean Bootstrap Toggle
========================

This widget provides more options on displaying a boolean field within Odoo's backend form views. Instead of 
'Checked' or 'Not Checked' you can now use this widget to display a Switch Button which will slide from 'On' to 
'Off' or 'Yes' to 'No' or whatever you have configured in your options. 

This widget is capable of utilizing all of bootstrap toggle's options including varrying colours, sizes, text and 
shape of the toggle widget. For instance you could display a "Yes" in Green and "No" in Red to contrast the two 
options.

Usage
=====

After you installed it, you can add the text widget='boolean_switch' to any boolean within a form view. This 
will change the checkbox to an 'On' or 'Off' button which slide from one to the other upon clicking. There are 
many options within the bootstrap-toggle library which you can use to make additional changes. They can all be 
utilized by providing an options dictionary. Go to bootstrap-toggle documentation to learn about all available 
options such as colours, size, text, shapes, etc. Here is a full example usage.



...
<field name="my_boolean" widget='boolean_switch' options="{'data-on':'Yes','data-off':'No','data-onstyle':'primary','data-offstyle':'danger','data-size':'mini'}"/>
...


The above example would create a mini size swich which displayed a 'Yes' when true and 'No' when false would 
display bootstrap's primary class colour when true and the danger class colour when false.



Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`.
In case of trouble, please check there if your issue has already been reported.


Credits
=======

Contributors
------------

 * AIM Systems <phillips@aimsystems.ca>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
