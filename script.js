const grid = document.getElementById("filmGrid");
const searchInput = document.getElementById("searchInput");
const ratingFilter = document.getElementById("ratingFilter");

const API_BASE = "https://api.imdbapi.dev";

let films = [];
const CACHE_VERSION = "v2";
const imdbCache = new Map();

const ratings = {
  0: {
    text: "0/3",
    className: "fail",
    commentary: "Does not meet any of the three Bechdel Test criteria.",
    criteria: [false, false, false]
  },
  1: {
    text: "1/3",
    className: "one",
    commentary: "Meets the first criterion: includes at least two women.",
    criteria: [true, false, false]
  },
  2: {
    text: "2/3",
    className: "two",
    commentary: "Meets the first two criteria: women appear and speak to each other.",
    criteria: [true, true, false]
  },
  3: {
    text: "3/3",
    className: "pass",
    commentary: "Meets all three criteria: women speak to each other about something other than a man.",
    criteria: [true, true, true]
  }
};

function decodeHTML(text) {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

function getIMDbId(film) {
  return `tt${film.imdbid}`;
}

async function loadBechdelData() {
  try {
    const res = await fetch("bechdel.json");

    if (!res.ok) {
      throw new Error(`Could not load bechdel.json: ${res.status}`);
    }

    films = await res.json();
    render();
  } catch (error) {
    console.error(error);
    grid.innerHTML = `
      <p class="error">
        Could not load <strong>bechdel.json</strong>. Make sure you are using Live Server.
      </p>
    `;
  }
}

async function fetchIMDbData(film, attempt = 1) {
  const imdbId = getIMDbId(film);
  const cacheKey = `${CACHE_VERSION}-${imdbId}`;

  if (imdbCache.has(cacheKey)) {
    return imdbCache.get(cacheKey);
  }

  const url = `${API_BASE}/titles/${imdbId}`;

  try {
    const res = await fetch(url, {
      cache: "no-store"
    });

    if (!res.ok) {
      console.warn(`IMDb failed for ${imdbId}: ${res.status}`);

      if (attempt < 3) {
        await wait(700 * attempt);
        return fetchIMDbData(film, attempt + 1);
      }

      return null;
    }

    const data = await res.json();

  // make sure valid data
    if (data && data.id) {
      imdbCache.set(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.warn(`Network/API error for ${imdbId}:`, error);

    if (attempt < 3) {
      await wait(700 * attempt);
      return fetchIMDbData(film, attempt + 1);
    }

    return null;
  }
}

function createCriteriaDots(criteria) {
  return `
    <div class="criteria" aria-label="Bechdel criteria">
      <span class="${criteria[0] ? "met" : ""}" title="At least two women">1</span>
      <span class="${criteria[1] ? "met" : ""}" title="They talk to each other">2</span>
      <span class="${criteria[2] ? "met" : ""}" title="About something besides a man">3</span>
    </div>
  `;
}

function createCard(film, index) {
  const rating = ratings[film.rating] || ratings[0];

  const card = document.createElement("article");
  card.className = "card loading-card";
  card.style.animationDelay = `${Math.min(index * 35, 700)}ms`;

  card.innerHTML = `
    <div class="poster no-poster shimmer">loading image</div>

    <div class="card-body">
      <div class="card-topline">
        <span class="year">${film.year}</span>
        <span class="imdb">tt${film.imdbid}</span>
      </div>

      <h2>${decodeHTML(film.title)}</h2>

      <div class="bechdel-row">
        <span class="badge ${rating.className}">${rating.text}</span>
        ${createCriteriaDots(rating.criteria)}
      </div>

      <p class="bechdel-note">${rating.commentary}</p>

      <p class="plot">Loading film details...</p>
    </div>
  `;

  return card;
}

function updateCard(card, film, data) {
  const poster = card.querySelector(".poster");
  const plot = card.querySelector(".plot");
  const titleEl = card.querySelector("h2");
  const yearEl = card.querySelector(".year");

  card.classList.remove("loading-card");

  if (!data) {
    poster.className = "poster no-poster";
    poster.textContent = "no image";
    plot.textContent = "No extra film information available.";
    return;
  }

  const title = data.primaryTitle || decodeHTML(film.title);
  const image = data.primaryImage?.url || data.image?.url || data.poster || null;
  const year = data.startYear || film.year;
  const genres = data.genres?.length ? data.genres.slice(0, 3).join(", ") : null;
  const runtime = data.runtimeSeconds
    ? `${Math.round(data.runtimeSeconds / 60)} min`
    : null;

  titleEl.textContent = title;
  yearEl.textContent = year;

  if (image) {
    poster.outerHTML = `
      <img 
        class="poster loaded-image" 
        src="${image}" 
        alt="Poster for ${title}"
        loading="lazy"
      />
    `;
  } else {
    poster.className = "poster no-poster";
    poster.textContent = "no image";
  }

  const detailParts = [runtime, genres].filter(Boolean);

  const plotText =
  data.plot ||
  data.plotText?.plainText ||
  data.plots?.[0]?.plotText?.plainText ||
  data.plots?.edges?.[0]?.node?.plotText?.plainText ||
  null;

if (plotText) {
  plot.textContent = detailParts.length
    ? `${detailParts.join(" · ")}. ${plotText}`
    : plotText;
} else {
  plot.textContent = detailParts.length
    ? detailParts.join(" · ")
    : "No plot available.";
}
}

async function loadIMDbForCards(cardFilmPairs) {
  await Promise.all(
    cardFilmPairs.map(async ({ card, film }) => {
      const data = await fetchIMDbData(film);
      updateCard(card, film, data);
    })
  );
}

function render() {
  grid.innerHTML = "";

  const search = searchInput.value.toLowerCase();
  const filter = ratingFilter.value;

  const filteredFilms = films
    .filter(film => decodeHTML(film.title).toLowerCase().includes(search))
    .filter(film => filter === "all" || String(film.rating) === filter)
    .slice(0, 8);

  if (filteredFilms.length === 0) {
    grid.innerHTML = `<p class="empty">No films found.</p>`;
    return;
  }

  const cardFilmPairs = filteredFilms.map((film, index) => {
    const card = createCard(film, index);
    grid.appendChild(card);
    return { card, film };
  });

  loadIMDbForCards(cardFilmPairs);
}

searchInput.addEventListener("input", render);
ratingFilter.addEventListener("change", render);

loadBechdelData();