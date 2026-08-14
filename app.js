const DATABASE_URL = "data/movies.json";
const SUGGESTION_EMAIL = "mauryaarpit2008@gmail.com";

const priorityRank = {
  high: 1,
  medium: 2,
  low: 3
};

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupSuggestionForm();
  loadMovies();
});

function setupMenu() {
  const menu = document.getElementById("mobileMenu");
  const button = document.querySelector(".menu");

  if (!menu || !button) {
    return;
  }

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!menu.classList.contains("open")) {
      return;
    }

    if (!menu.contains(event.target) && event.target !== button) {
      closeMenu(menu, button);
    }
  });

  menu.addEventListener("click", () => closeMenu(menu, button));
}

function closeMenu(menu, button) {
  menu.classList.remove("open");
  document.body.classList.remove("menu-open");
  button.setAttribute("aria-expanded", "false");
}

async function loadMovies() {
  const views = document.querySelectorAll("[data-view]");

  if (!views.length) {
    return;
  }

  try {
    const response = await fetch(DATABASE_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Could not load ${DATABASE_URL}`);
    }

    const movies = await response.json();
    renderPage(movies);
  } catch (error) {
    views.forEach((view) => {
      view.innerHTML = `<div class="load-error">The movie database could not be loaded. Publish through GitHub Pages or run a local static server to preview this page.</div>`;
    });
    console.error(error);
  }
}

function renderPage(movies) {
  renderCounts(movies);
  renderStats(movies);
  renderSpotlight(movies);
  renderCatalog(movies);
  renderList("watched", getWatchedMovies(movies));
  renderList("watch-later", getWatchLaterMovies(movies));
}

function renderCounts(movies) {
  const counts = {
    watched: getWatchedMovies(movies).length,
    "watch-later": getWatchLaterMovies(movies).length
  };

  document.querySelectorAll("[data-count]").forEach((heading) => {
    const key = heading.dataset.count;
    const label = key === "watch-later" ? "Watch later" : "Watched";
    heading.textContent = `${label} (${counts[key] || 0})`;
  });
}

function renderStats(movies) {
  const target = document.querySelector('[data-view="stats"]');

  if (!target) {
    return;
  }

  const watched = getWatchedMovies(movies);
  const queued = getWatchLaterMovies(movies);
  const topRating = watched.length
    ? Math.max(...watched.map((movie) => Number(movie.rating || 0))).toFixed(1)
    : "0.0";
  target.innerHTML = [
    statTemplate(movies.length, "Movies in database"),
    statTemplate(watched.length, "Watched"),
    statTemplate(queued.length, "Watch later"),
    statTemplate(topRating, "Top rating")
  ].join("");
}

function statTemplate(value, label) {
  return `<article class="stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`;
}

function renderSpotlight(movies) {
  const target = document.querySelector('[data-view="spotlight"]');

  if (!target) {
    return;
  }

  const featured = [...getWatchedMovies(movies)].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0] || movies[0];

  if (!featured) {
    target.innerHTML = `<div class="empty-state">Add your first movie in <code>data/movies.json</code>.</div>`;
    return;
  }

  target.innerHTML = `
    <article class="spotlight">
      ${posterTemplate(featured)}
      <div class="spotlight-content">
        <span class="spotlight-kicker">Highest rated ${featured.rating ? `${escapeHtml(featured.rating)}/10` : ""}</span>
        <h2>${escapeHtml(featured.title)}</h2>
        <p>${escapeHtml(featured.logline || featured.review || "")}</p>
      </div>
    </article>
  `;
}

function renderCatalog(movies) {
  const target = document.querySelector('[data-view="catalog"]');

  if (!target) {
    return;
  }

  const searchInput = document.getElementById("movieSearch");
  const statusFilter = document.getElementById("statusFilter");
  const sortFilter = document.getElementById("sortFilter");

  const paint = () => {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const status = statusFilter?.value || "all";
    const sort = sortFilter?.value || "rating";

    const filtered = movies
      .filter((movie) => status === "all" || movie.status === status)
      .filter((movie) => searchableText(movie).includes(query));

    target.innerHTML = sortMovies(filtered, sort).map(cardTemplate).join("") || emptyTemplate("No movies match that search.");
  };

  [searchInput, statusFilter, sortFilter].forEach((control) => {
    control?.addEventListener("input", paint);
  });

  paint();
}

function renderList(viewName, movies) {
  const target = document.querySelector(`[data-view="${viewName}"]`);

  if (!target) {
    return;
  }

  const sort = viewName === "watch-later" ? "priority" : "rating";
  const message = viewName === "watch-later"
    ? "The queue is empty."
    : "No watched movies yet.";

  target.innerHTML = sortMovies(movies, sort).map(rowTemplate).join("") || emptyTemplate(message);
}

function getWatchedMovies(movies) {
  return movies.filter((movie) => movie.status === "watched");
}

function getWatchLaterMovies(movies) {
  return movies.filter((movie) => movie.status === "watch-later");
}

function sortMovies(movies, sort) {
  const copy = [...movies];

  if (sort === "title") {
    return copy.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sort === "year") {
    return copy.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  }

  if (sort === "recent") {
    return copy.sort((a, b) => new Date(b.watchedDate || 0) - new Date(a.watchedDate || 0));
  }

  if (sort === "priority") {
    return copy.sort((a, b) => (priorityRank[a.priority] || 9) - (priorityRank[b.priority] || 9));
  }

  return copy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
}

function searchableText(movie) {
  return [
    movie.title,
    movie.year,
    movie.language,
    movie.country,
    movie.status,
    movie.priority,
    movie.logline,
    movie.review,
    ...(movie.genres || []),
    ...(movie.moods || []),
    ...(movie.tags || [])
  ].join(" ").toLowerCase();
}

function cardTemplate(movie) {
  return `
    <article class="movie-card">
      ${posterTemplate(movie)}
      <div class="movie-card-body">
        <div class="rating-line">
          <span>${ratingText(movie)}</span>
          ${statusPill(movie)}
        </div>
        <h3>${escapeHtml(movie.title)}</h3>
        ${metaTemplate(movie)}
        <p class="summary">${escapeHtml(movie.logline || movie.review || "")}</p>
        ${tagTemplate(movie)}
      </div>
    </article>
  `;
}

function rowTemplate(movie) {
  return `
    <article class="movie-row">
      ${posterTemplate(movie)}
      <div class="row-info">
        <div class="rowtop">
          <span>${ratingText(movie)}</span>
          <span>${dateOrPriority(movie)}</span>
        </div>
        <h2>${escapeHtml(movie.title)}</h2>
        ${metaTemplate(movie)}
        <p class="summary">${escapeHtml(movie.review || movie.logline || "")}</p>
        ${movie.note ? `<p class="note"><b>My note</b><br>${escapeHtml(movie.note)}</p>` : ""}
        ${tagTemplate(movie)}
      </div>
    </article>
  `;
}

function posterTemplate(movie) {
  const title = escapeHtml(movie.posterTitle || movie.title);
  const style = `--accent-one:${escapeHtml(movie.accent?.[0] || "#293241")};--accent-two:${escapeHtml(movie.accent?.[1] || "#8d6b56")}`;
  const image = movie.poster
    ? `<img src="${escapeAttribute(movie.poster)}" alt="${escapeAttribute(movie.title)} poster" loading="lazy" decoding="async">`
    : "";
  const imageClass = movie.poster ? " has-image" : "";

  return `
    <div class="poster-art${imageClass}" style="${style}">
      ${image}
      <strong class="poster-title">${title}</strong>
    </div>
  `;
}

function statusPill(movie) {
  const isQueue = movie.status === "watch-later";
  const text = isQueue ? "Watch later" : "Watched";
  return `<span class="status-pill${isQueue ? " queue" : ""}">${text}</span>`;
}

function ratingText(movie) {
  if (movie.status === "watch-later" && !movie.rating) {
    return "Priority: " + titleCase(movie.priority || "medium");
  }

  return movie.rating ? `${escapeHtml(movie.rating)}/10` : "Unrated";
}

function dateOrPriority(movie) {
  if (movie.status === "watch-later") {
    return `Priority: ${escapeHtml(titleCase(movie.priority || "medium"))}`;
  }

  if (!movie.watchedDate) {
    return "Watched";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${movie.watchedDate}T00:00:00`));
}

function metaTemplate(movie) {
  const pieces = [
    movie.language,
    ...(movie.genres || []),
    movie.year
  ].filter(Boolean);

  return `<p class="meta">${pieces.map(escapeHtml).join(" / ")}</p>`;
}

function tagTemplate(movie) {
  const tags = [...(movie.moods || []), ...(movie.tags || [])].slice(0, 5);

  if (!tags.length) {
    return "";
  }

  return `<div class="tag-list">${tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function emptyTemplate(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function setupSuggestionForm() {
  const form = document.getElementById("suggestionForm");

  if (!form) {
    return;
  }

  const status = document.getElementById("suggestionStatus");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const suggestion = {
      title: String(formData.get("title") || "").trim(),
      year: String(formData.get("year") || "").trim(),
      from: String(formData.get("from") || "").trim(),
      reason: String(formData.get("reason") || "").trim(),
      createdAt: new Date().toISOString()
    };

    saveSuggestionLocally(suggestion);

    const subject = `Kaiho movie suggestion: ${suggestion.title}`;
    const body = [
      `Movie: ${suggestion.title}`,
      suggestion.year ? `Year: ${suggestion.year}` : "",
      suggestion.from ? `From: ${suggestion.from}` : "",
      "",
      "Reason:",
      suggestion.reason
    ].filter((line) => line !== "").join("\n");

    window.location.href = `mailto:${SUGGESTION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (status) {
      status.textContent = "Opening your email app. A local copy was kept in this browser.";
    }

    form.reset();
  });
}

function saveSuggestionLocally(suggestion) {
  const key = "kaihoMovieSuggestions";
  let existing = [];

  try {
    existing = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    existing = [];
  }

  if (!Array.isArray(existing)) {
    existing = [];
  }

  existing.unshift(suggestion);
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
}

function titleCase(value) {
  return String(value).replace(/\b\w/g, (match) => match.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
