Signup System Final - Flat single-folder deployment

Files included (27). Fill config.env before running.

Run locally:
  npm install
  In one terminal: npm run worker
  In another: npm start

API endpoints (call these from frontend):
  POST /signup  { firstName, lastName, email, password, behavior }
    -> returns { success:true, tempToken }
  POST /verify  { email, code }
    -> returns { success:true, token, truId }
  POST /resend  { email }
    -> returns { success:true }

Notes:
- tempToken is short-lived JWT to store in localStorage during verification step.
- permanent token is normal JWT (30 days). Remove it on logout from frontend.
- All files are in one folder (flat) to simplify deployment to Render (two services: API and Worker).
