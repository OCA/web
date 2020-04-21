from . import models
from . import wizards


def pre_init_hook(cr):
    """take care to move the domain field to domain_this to keep the values"""
    cr.execute(
        'SELECT count(attname) FROM pg_attribute '
        'WHERE attrelid = '
        '(SELECT oid FROM pg_class WHERE relname = %s) '
        'AND attname = %s', ('ir_filters', 'domain_this'))
    if not cr.fetchone()[0]:
        cr.execute('ALTER table ir_filters RENAME domain TO domain_this')


def uninstall_hook(cr, registry):
    """move domain_this back to domain"""
    cr.execute('ALTER TABLE ir_filters RENAME domain_this TO domain')
