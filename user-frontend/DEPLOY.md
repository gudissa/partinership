Changing API host (Vite)

This frontend reads the backend base URL from the Vite env var `VITE_API_URL`.

To change which API host the app talks to, create or edit `.env` in this folder and set:

VITE_API_URL=http://your-api-host:5000

Then restart the dev server. Production builds will also use the environment provided at build time.

If you prefer to keep doc links in the README, we can also append the same note into `README.md` on request.
