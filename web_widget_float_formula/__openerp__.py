# -*- encoding: utf-8 -*-
###############################################################################
#    See Copyright and Licence Informations undermentioned.
###############################################################################
{
    'name': 'Web Widget - Formulas in Float fields',
    'version': '1.0',
    'category': 'web',
    'description': """
Allow to write simple mathematic formulas in Integer / Float fields
===================================================================

Functionnalities:
------------------
    * Possibility to tip a text like "=45 + 4/3 - 5 * (2 +1)";
    * if the formula is correct, The result will be computed and displayed;
    * if the formula is not correct, the initial text is displayed;

Documentations:
------------------
    * Video: http://www.youtube.com/watch?v=jQGdD34WYrA&hd=1

Technical informations:
------------------------
    * Overloads "instance.web.form.FieldFloat"; (so works for fields.integer &
      fields.float);
    * To compute, the module simply use the eval() javascript function;
    * Rounding computation is not done by this module (The module has the same
      behaviour if the user tips "=1/3" or if he tips "0.33[...]");
    * avoid code injonction by regexpr test: "=alert('security')" is not valid;

Limits:
--------
    * Only supports the four operators: "+" "-" "*" "/" and parenthesis;

Copyright and Licence:
-----------------------
    * 2013, Groupement Régional Alimentaire de Proximité
      (http://www.grap.coop/)
    * Licence: AGPL-3 (http://www.gnu.org/licenses/)

Contacts :
----------
    * Sylvain LE GAL (https://twitter.com/legalsylvain);
    * <informatique@grap.coop> for any help or question about this module.
    """,
    'author': "GRAP,Odoo Community Association (OCA)",
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [],
    'demo': [],
    'js': [
        'static/src/js/models.js',
    ],
    'css': [],
    'qweb': [],
    'images': [],
    'post_load': '',
    'application': False,
    'installable': True,
    'auto_install': False,
    'images': [],
}
