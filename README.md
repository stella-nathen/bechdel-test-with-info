# Bechdel Archive

Bechdel Archive is a small interactive film database that lets users search through films and filter them by their Bechdel Test rating. The project combines local Bechdel Test data with live IMDb-style film information, including posters, years, genres, runtime, and plot details.

The website is designed as a pastel, early-web inspired archive: simple, colourful, card-based, and easy to browse.

## Project Overview

This project was created to explore how film data can be presented in a more accessible and visually engaging way. Instead of showing the Bechdel Test as just a score, the website breaks the rating down into three visible criteria:

1. The film includes at least two women.
2. The women speak to each other.
3. They speak about something other than a man.

Each film appears as a card with its poster, title, year, IMDb ID, Bechdel rating, criteria dots, and extra film details where available.

## Features

- Search films by title
- Filter films by Bechdel Test rating
- Display 8 films at a time
- Load poster images and plot details from an external IMDb API
- Show each film as a compact visual card
- Display Bechdel criteria using numbered indicators
- Use pastel colours and simple 2D styling
- Handle missing posters or unavailable film information

## Technologies Used

- HTML
- CSS
- JavaScript
- JSON
- Bechdel Test dataset
- IMDb API data from `https://api.imdbapi.dev`

## How It Works

The site loads local Bechdel Test data from `bechdel.json`. Each film in the dataset includes a title, year, IMDb ID, and Bechdel rating.

When the page loads, the JavaScript:

1. Fetches the local Bechdel data.
2. Filters the films based on the search input and rating dropdown.
3. Displays the first 8 matching films.
4. Creates a card for each film.
5. Uses the IMDb ID to request extra film information from the IMDb API.
6. Updates each card with a poster, runtime, genre, and plot if that information is available.

If the external API does not return information for a film, the card still appears using the local Bechdel data.

## Bechdel Rating System

The ratings are shown from 0/3 to 3/3:

| Rating | Meaning |
|---|---|
| 0/3 | Does not meet any of the three criteria |
| 1/3 | Includes at least two women |
| 2/3 | Includes at least two women who speak to each other |
| 3/3 | Includes at least two women who speak to each other about something other than a man |

## Design Direction

The visual style is inspired by early web design and small online archives. I wanted the website to feel more like a fun digital catalogue than a modern streaming platform.

The design uses:

- White background
- Pastel colour blocks
- Simple black borders
- Flat 2D cards
- Compact poster images
- Clear grid layout
- Minimal effects and animations

This makes the website feel playful while still keeping the film information organised and readable.

## Files

```text
index.html      Main website structure
style.css       Visual styling and layout
script.js       Loads data, filters films, creates cards, and fetches IMDb details
bechdel.json    Local Bechdel Test film dataset
