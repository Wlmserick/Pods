# Pod early access page

This is a static HTML, CSS, and JavaScript page with a Netlify Function for
early-access signups. When someone requests access, the function adds their
email to a Brevo contact list and sends them a confirmation email. The same
list can be used for the launch announcement.

## Configure Brevo and Netlify

1. In Brevo, create a contact list and verify the sender email address you want
   to use for Pod.
2. In the Netlify site settings, add these environment variables:
   - `BREVO_API_KEY`: a Brevo API key with contact and transactional email access.
   - `BREVO_LIST_ID`: the numeric ID of the early-access contact list.
   - `BREVO_SENDER_EMAIL`: the verified sender email address.
3. Deploy the project to Netlify. The included `netlify.toml` publishes the
   project root and configures `netlify/functions` as the Functions directory.
4. Test a signup using an address you control and confirm the address appears
   in the Brevo list and receives the confirmation email.

The Brevo API key belongs only in Netlify environment settings; never put it in
the page source or commit it to the project. Opening `index.html` directly
from disk does not run Netlify Functions, so the signup only works on the
deployed site.
