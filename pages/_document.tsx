import { Html, Head, Main, NextScript } from "next/document";

// Drive the Instant Games startup handshake from a plain inline script that
// runs the moment the (synchronous) SDK script has loaded — exactly the
// execution model of Facebook's official 8.0 example. This deliberately does
// NOT wait for React/Next hydration: the FB loading screen only dismisses when
// startGameAsync() resolves, so the handshake must not be coupled to the app
// bundle executing. React reads the result via the `fb-instant-ready` event /
// `window.__FB_INSTANT_READY__` flag.
const fbInstantBootstrap = `
(function () {
  function done() {
    window.__FB_INSTANT_READY__ = true;
    window.dispatchEvent(new Event("fb-instant-ready"));
  }
  if (!window.FBInstant) { done(); return; }
  window.FBInstant.initializeAsync()
    .then(function () {
      window.FBInstant.setLoadingProgress(100);
      return window.FBInstant.startGameAsync();
    })
    .then(done)
    .catch(function (err) {
      console.error("[FBInstant] startup failed:", err);
      done();
    });
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://connect.facebook.net/en_US/fbinstant.8.0.js" />
        <script dangerouslySetInnerHTML={{ __html: fbInstantBootstrap }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
