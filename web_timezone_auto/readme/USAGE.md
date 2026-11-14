Nothing to do: *Automatic Time Zone* is checked for every user, existing ones included.

To keep a fixed time zone, open *Preferences*, uncheck *Automatic Time Zone* and pick the time zone. While the box
is checked, the time zone field is read-only. Administrators find the same setting in the user form.

The time zone is never written:

- when the browser gives an unknown time zone;
- while an administrator impersonates the user (`impersonate_login`);
- for the superuser.
