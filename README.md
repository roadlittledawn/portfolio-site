[![Netlify Status](https://api.netlify.com/api/v1/badges/784104a7-d750-4a1a-b38f-17308981182b/deploy-status)](https://app.netlify.com/sites/clintonlangosch/deploys)

# Hi, I'm Clinton 👋

# Site tech

This is the repo for all professional things Clinton. My site is built with [Astro](https://astro.build/) and deployed via [Netlify](https://www.netlify.com/).

The design is my own, cobbled together from various patterns / designs in recent projects.

I use [Feather](https://feathericons.com/) and [Devicon](https://devicon.dev/) for icons.

Site logo was made my [Matt Morris-Cook](https://www.linkedin.com/in/mmc-resume/) (aka, MMC || Cookie).

# Run locally

Requirements to run locally:

- Node.js version 22 or higher
- npm

To run locally:

1. Clone the repo.
2. Run `npm install`.
3. Run local development server via `npm start`.

# Deploy to Netlify

PRs to `main-tw` branch will automatically deploy to Netlify.

# Site domain

Site is live at https://tw.clintonlangosch.com/.

# Generate resume PDF

Repo contains a workflow that can automatically generate resume PDF. Currently only works by hitting production resume page.

# Sync career data

Career data is automatically synced from a GraphQL API via GitHub Actions:

- **Automatic sync**: Runs weekly on Sundays at midnight UTC
- **Manual sync**: Can be triggered manually via GitHub Actions workflow dispatch
- **Smart updates**: Only commits and deploys if actual content changes are detected (ignores array reordering)

The workflow fetches data from the GraphQL API, normalizes it by sorting all arrays by MongoDB ID for consistent comparison, and updates `src/data/careerData.json` if changes are detected.

## Manual sync

To manually sync career data locally:

1. Set environment variables:
   ```bash
   export GRAPHQL_ENDPOINT="your-api-endpoint"
   export GRAPHQL_API_KEY="your-api-key"
   ```
2. Run `npm run sync-data`

## GitHub Secrets

The following secrets must be configured in the GitHub repository:
- `GRAPHQL_ENDPOINT`: The GraphQL API endpoint URL
- `GRAPHQL_API_KEY`: The API key for authentication

## Known Issues

- Skills `iconName` field may be outdated in the API and may require manual updates
