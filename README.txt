ARIA HOLIDAY · Himmafushi guest house booking app
==================================================

FILES
  index.html                       the whole app (logo built in)
  netlify/functions/bml-pay.js     creates the BML Connect card payment
  netlify/functions/bml-verify.js  checks the payment when the guest comes back
  netlify.toml                     tells Netlify where the functions are
  firestore-rules.txt              rules to add to your Quize Firebase
  aria-logo-original.jpg           full-size logo

1) FIREBASE (so bookings reach you from every phone)
  - Open index.html, find CONFIG at the top of the <script>, and paste your
    Quize Firebase web config into FIREBASE (apiKey, authDomain, projectId...).
  - Firebase → Firestore → Rules: add the blocks in firestore-rules.txt, Publish.
  - Firebase → Authentication → Users → Add user: admin@ariaholiday.app + a password.
  (With no Firebase config the app runs in demo mode: data stays in one browser,
   admin PIN 2468.)

2) DEPLOY
  - Upload this folder to GitHub, then Netlify → Add new site → Import from GitHub.
  - Netlify will pick up netlify.toml and the functions automatically.

3) CARD PAYMENTS (BML Connect gateway)
  - The guest house applies for BML Connect at Bank of Maldives and gets an
    API key + App ID from the BML merchant portal.
  - Netlify → Site configuration → Environment variables, add:
       BML_API_KEY = (api key)
       BML_APP_ID  = (app id)
       BML_MODE    = test        (change to production when going live)
  - Redeploy. Until the keys are added, the Card option shows a DEMO checkout
    and no card is charged.
  - Currency: set USD or MVR in Admin → Settings. The BML merchant account must
    accept that currency.
  - Always double-check card payments in the BML merchant portal before guests
    arrive. The app shows the amount BML reports as paid.

4) ADMIN (host desk)
  - Tap the Aria logo at the top of the home page 5 times quickly.
  - Bookings: confirm, cancel, record payment, view bank slips, WhatsApp guests,
    and a 14-day occupancy chart.
  - Rooms: prices, number of rooms, max guests, photos (upload real photos to
    replace the illustrations).
  - Experiences, taxes (TGST 17%, green tax $6), deposit %, speedboat price,
    bank details, PayPal.me and which payment options to show.

Contact details (WhatsApp 7983841, email) are placeholders: change them in
Admin → Settings.
