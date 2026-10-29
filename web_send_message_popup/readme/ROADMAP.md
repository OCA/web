Modules that extend the full composer's context by overriding
`Composer.fullComposerAdditionalContext` do not affect the popup this module
opens: the action is built from the chatter, not from a rendered composer, so
that getter is never consulted. Extend
`Chatter.openFullComposer` instead.
