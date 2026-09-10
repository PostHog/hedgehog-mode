// Proves the CSP is actually enforced before any assertion about pixi means anything.
//
// This has to be an external file, not an inline <script>: `script-src 'self'` blocks inline
// script, and it must not run through the test driver either — CDP's Runtime.evaluate is
// exempt from CSP, so an eval probe injected from the spec reports "allowed" even when the
// header is live. Only page-authored, same-origin script gives an honest answer.
(function () {
  try {
    // eslint-disable-next-line no-eval
    (0, eval)("1+1");
    window.__cspProbe = "allowed";
  } catch (error) {
    window.__cspProbe = "blocked:" + error.name;
  }
})();
