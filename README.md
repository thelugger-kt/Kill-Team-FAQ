# Kill Team FAQ

A community-maintained, browsable, and searchable list of Kill Team rulings, built as a static
website with no build tools required to run it.

## Project structure

```
Rulings/Kill Team FAQ.xlsx   Source spreadsheet of Q&A rulings, one sheet per category
scripts/build_data.py        Converts the spreadsheet into data/rulings.json
data/rulings.json            Generated data consumed by the site (do not hand-edit; regenerate it)
index.html                   Browse/search page
about.html                   About & contact page
credits.html                 Credits page
css/styles.css               Site styles (dark theme, orange accents)
js/app.js                    Search/accordion behavior + shared mobile nav toggle
```

## Updating the rulings

1. Edit `Rulings/Kill Team FAQ.xlsx` (add rows to existing sheets, or add a new sheet).
   - Each sheet's first row must be a header row using column names `Question`, `Answer`, and
     optionally `Faction` and/or `Season`.
   - If you add a brand-new sheet, also add its name to `SHEET_ORDER` in
     `scripts/build_data.py` so it appears in the right place instead of at the end.
2. Regenerate the data file:

   ```
   python scripts/build_data.py
   ```

   This requires the `openpyxl` package (`pip install openpyxl` if you don't already have it).
3. Refresh the site locally to confirm the new rulings show up correctly (see below), then commit
   both the updated spreadsheet and the regenerated `data/rulings.json`.

## Viewing locally

Because the site loads `data/rulings.json` via `fetch()`, most browsers will block that request if
you open `index.html` directly from disk (the `file://` protocol). Instead, serve the folder with a
simple local server, for example:

```
python -m http.server 8000
```

Then open http://localhost:8000/ in your browser.

## Deploying to GitHub Pages

1. Create a GitHub repository and push this project to it.
2. In the repository's **Settings → Pages**, set the source to deploy from the `main` (or
   `master`) branch, root folder.
3. GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/`.

Whenever you update the spreadsheet, re-run `scripts/build_data.py`, commit the changes, and push —
GitHub Pages will redeploy automatically.
