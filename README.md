# Algo Amigo — Event Website

**Good code. Better company.** Algo Amigo is a student-friendly tech meetup concept for curious coders, builders, and people who enjoy solving problems together.

The site uses a dark editorial look, vivid lime accents, oversized typography, subtle grain, responsive layouts, and motion that adds energy without getting in the way. Event logistics that have not been confirmed are deliberately marked as placeholders rather than presented as facts.

## What's included

- **Home:** Event introduction, key themes, and clear registration calls to action.
- **The experience:** Event overview, a draft run of show, and FAQs.
- **Explore:** GitHub repository search with query input, language filter, sorting, pagination, loading states, empty results, and API error handling.
- **Register:** RSVP form connected to an Express endpoint.
- **Motion and accessibility:** Button and card transitions, scroll-reveal effects, keyboard focus styles, semantic landmarks, labelled controls, status announcements, and reduced-motion support.
- **Backend demo:** Node.js and Express expose health, RSVP, and feedback endpoints. RSVP data is saved to `data.json`.
- **Consistent formatting:** Prettier configuration and formatting scripts are included.

## Tech stack

- HTML, CSS, and vanilla JavaScript
- Node.js and Express
- GitHub's public REST API
- JSON file storage for local demonstration only
- Prettier for code formatting

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Open a terminal in the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Visit [http://localhost:3000](http://localhost:3000).

Open the website through the local server, not by double-clicking the HTML files, so the RSVP form can reach the backend.

## Useful commands

```bash
npm start            # Start the site and API
npm run dev          # Restart the server when server.js changes
npm run check        # Check JavaScript syntax
npm run format       # Format supported project files with Prettier
npm run format:check # Check formatting without changing files
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check that the server is running |
| `GET` | `/api/rsvps` | View saved registrations (local demo endpoint; do not expose publicly) |
| `POST` | `/api/rsvps` | Validate and save a registration |
| `POST` | `/api/feedback` | Save feedback |

Example RSVP request:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "year": "Second year",
  "interest": "Web development"
}
```

## Customize before submitting

- Replace **“Date announced soon”** and **“Venue announced soon”** with confirmed event details.
- Update agenda timings and registration copy if needed.
- Add your organizers, speaker names, event socials, and official registration policies.
- The RSVP API stores data in a local JSON file for a student demo; use a database and stronger validation for a deployed production website.
- GitHub's public API has unauthenticated rate limits; the Explore page surfaces API errors and lets users retry.

### Design choices to consider

The current concept is intentionally branded as a welcoming, informal coding meetup. Before handing it in, make sure the event format, intended audience, schedule, registration wording, and contact details match your actual event. Do not publish invented speakers, venue details, dates, or policies.

## Security and deployment notes

- `data.json` is suitable only for a small local demo. Concurrent writes, backups, access controls, and data retention are not production-ready; use a database for a real event.
- **Privacy warning:** `/api/rsvps` returns attendee details without authentication to make local testing straightforward. Do not expose this endpoint on a public deployment. Add administrator authentication and return only the minimum attendee data needed.
- Validate and sanitize incoming data on the server, use HTTPS in production, and publish a clear privacy notice before collecting real attendee information.
- GitHub's unauthenticated API has rate limits. The Explore page displays an error message when the limit is reached or the network is unavailable and offers a retry path.
