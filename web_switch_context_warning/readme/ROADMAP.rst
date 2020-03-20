    * If the browser don't implement Shared Worker (http://www.w3.org/TR/workers/#sharedworker), the warning message will not be displayed (there is no polyfill).

    * Switching user or database in a separate browser or in private browsing mode will not be detected by this module. It's a limitation of Shared Worker(limit to browser session, server:port...)
