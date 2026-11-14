Web Portal Discuss
==================

This module lets portal users participate in native Discuss channels to which
an internal user has added their partner as a member.

Security model
--------------

* Native ``discuss.channel.member`` membership is the only portal permission.
* Internal users manage channel membership with the standard Discuss interface.
* Portal users can read and participate in authorized channels only.
* Portal users cannot create channels, manage members, or invite users.
* No portal invitation, token, or signup workflow is provided by this module.

The module reuses the Discuss client and applies the membership check server
side on portal requests.
