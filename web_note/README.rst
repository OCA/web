Web Note
================

This module can be used for adding a notes field in any module that need them.
There are three type of notes - private, internal, external. 
Only the user that create a private note can see it. The other two types can be used for creating different views.

Installation
============

Installing the module itself is enough.

Configuration
=============

No configuration required.

Usage
=====

To use this module, you need to:

 * Add dependencie to 'web_note' in the __openerp__.py file of the module in which you need the webnotes(your module).
 * inherit the web.note class and add many2one field connected with your model
 * in your model create one2many field to web.note model
 * add the field in the view you want
 


Versions
========

v7.0.1.0
----
   

