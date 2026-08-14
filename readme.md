# Kaiho Movie Vault

Kaiho Movie Vault is a personal, client-side movie database for GitHub Pages.

It is designed as a public read-only site: visitors can browse your watched movies, watch-later queue, ratings, notes, moods, and tags, but they cannot modify the movie database from the website.

## What changed

- Static movie database in `data/movies.json`
- Home page with spotlight, stats, search, status filter, and sorting
- Watched page generated from the database
- Watch Later page generated from the database
- Suggestion page that opens a prefilled email to `mauryaarpit2008@gmail.com`
- No backend, no Node server, no framework, and no build step

## Edit Your Movie Database

Open `data/movies.json` and add or edit movie objects.

Use `status: "watched"` for archive entries:

```json
{
  "id": "example-movie",
  "title": "Example Movie",
  "posterTitle": "EXAMPLE",
  "year": 2026,
  "language": "Hindi",
  "country": "India",
  "status": "watched",
  "rating": 9.2,
  "watchedDate": "2026-08-14",
  "genres": ["Drama"],
  "moods": ["emotional"],
  "tags": ["personal"],
  "poster": "images/example.webp",
  "accent": ["#26384f", "#c48762"],
  "logline": "Short public description.",
  "review": "Longer public description.",
  "note": "Your private-style public note."
}
```

Use `status: "watch-later"` for queue entries:

```json
{
  "id": "queued-movie",
  "title": "Queued Movie",
  "posterTitle": "QUEUED",
  "year": 2025,
  "language": "Japanese",
  "country": "Japan",
  "status": "watch-later",
  "priority": "high",
  "genres": ["Animation", "Drama"],
  "moods": ["quiet"],
  "tags": ["anime"],
  "poster": "",
  "accent": ["#384b66", "#9f7068"],
  "logline": "Why it is in the queue.",
  "review": "A little more context."
}
```

## Posters

Add poster images inside `images/`, then set the movie's `poster` value:

```json
"poster": "images/my-poster.webp"
```

If `poster` is empty, the site creates a styled text poster using `posterTitle` and `accent`.

## Suggestions

`suggest.html` uses a client-side form. When someone submits it:

- their email app opens with a prefilled message to `mauryaarpit2008@gmail.com`
- a local copy is saved in that visitor's browser storage
- the public database is not changed

For automatic central storage, you would need a third-party form service or a backend. This project intentionally avoids that so it remains GitHub Pages friendly.

## GitHub Pages

Publish the repository as a static site:

1. Push these files to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Choose the branch and root folder.
5. Save.

The site should work without a build command.
