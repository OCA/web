Search views
============

On search views, this addon allows developers to show a predefined range of intervals. Use ``widget="date_interval"`` and an options dictionary to configure the addon, at least a type of interval. Currently, the only supported interval type is `iso_week`: ``options="{'type': 'iso_week'}"``.

Configuration options
---------------------

    type
        Possible values are ``iso_week`` (shows iso week numbers)

    date
        The reference date from which to calculate intervals if different from `now`

    lookahead
        The amount of intervals after `date` to offer to the user

    lookbehind
        The amount of intervals before `date` to offer to the user

    exclusive
        If truthy, selecting one interval will unselect all already selected intervals. If not set (default), selecting multiple intervals will yield a domain for all selected intervals

    cycle
        If truthy, the currently selected interval will be used for setting the reference date. The effect is that you can cycle through intervals rapidly in combination with `exclusive = 1` and `dropdown = 1`

    dropdown
        If truthy (default), the intervals to choose are shown as a dropdown menu
