This module adds 3 options to advanced search of char, many2one,
many2many and one2many fields:

* *starts with* (uses the domain *=ilike %<search string>*),
* *ends with* (uses the domain *=ilike <search string>%*),
* *matches* (uses the domain *=ilike <search string>*).

