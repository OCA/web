This module prevent clickjacking, by basically,
creating a style element (CSS on the fly)
to hide the body of the current page by default.
Then, if it doesn't detect clickjacking, it deletes it.
