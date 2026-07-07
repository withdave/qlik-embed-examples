# qlik-embed-examples

A simple Qlik Sense app, with all charts, hosted in GitHub pages via Qlik anonymous access. Includes some basic tests.

[![Playwright - nightly visual regression](https://github.com/withdave/qlik-embed-examples/actions/workflows/playwright_nightly.yml/badge.svg?event=schedule)](https://github.com/withdave/qlik-embed-examples/actions/workflows/playwright_nightly.yml)

## Overview

This repository provides a simple, hosted Qlik Sense app that demonstrates all available chart types. It includes:
- An embeddable web app (`embed/index.html`) for viewing the Qlik Sense app via Qlik's web components.
- Automated deployment to GitHub Pages for the embed app. This is configured to deploy to a Qlik Cloud anonymous tenant (note this is why the NL object won't render).
- Automated deployment of the Qlik Sense app (`src/*.qvf`) to your Qlik Cloud tenant using GitHub Actions.

---

## Repository Structure

- `embed/` — Contains the embeddable web app and deployment scripts
  - `index.html` — Main embed page (uses Qlik web components)
  - `index.css` — Styling for the embed page
  - `qlik-upload.js` — Node.js script to upload and publish Qlik Sense apps to your tenant
- `src/` — Contains Qlik Sense app files (`.qvf`)
- `.github/workflows/` — GitHub Actions workflows for automation
- `README.md` — This documentation

---

## Embed App (`embed/index.html`)


The `embed/` directory contains several example HTML pages that use Qlik's web components to display Qlik Sense apps and charts in different configurations:

- `index.html` — Index page for examples.
- `dual-classic-app.html` — Qlik Sense app overview using both @qlik/embed-web-components and @qlik/api.
- `solo-classic-app.html` — Qlik Sense app overview using @qlik/embed-web-components.
- `solo-analytics-sheet-selections.html` — Dynamic sheet loading for Qlik Sense sheets using @qlik/embed-web-components and Ref API.
- `solo-analytics-chart-otf.html` — On-the-fly analytics chart using @qlik/embed-web-components — switch between dimension/measure techniques, chart types, and states live.
- `solo-analytics-snapshot.html` — Static chart rendering using <code>data___json</code> and @qlik/embed-web-components (no backend required).
- `configurator.html` — Interactive Qlik Sense chart configurator using @qlik/embed-web-components.

These pages require several Qlik Cloud variables to be injected at build/deploy time:

- `{{qlikHost}}` — Your Qlik Cloud tenant host (e.g. `your-tenant.qlikcloud.com`)
- `{{qlikClientId}}` — OAuth client ID for anonymous access
- `{{qlikAccessCode}}` — Access code for the anonymous app share
- `{{qlikAppId}}` — The Qlik Sense app ID to display

These placeholders are replaced automatically during the GitHub Pages deployment workflow.

---

## GitHub Actions Workflows

### 1. Deploy Embed App to GitHub Pages

Workflow: `.github/workflows/pages.yml`

- **Triggers:** On push to `main` affecting `embed/**`, or manually via workflow dispatch
- **Steps:**
  1. Checks for required Qlik environment variables
  2. Replaces placeholders in `embed/index.html` with values from repository variables
  3. Uploads the `embed/` directory as a GitHub Pages artifact
  4. Deploys to GitHub Pages

#### Required Repository Variables (in GitHub repo settings > Variables):
- `QLIK_HOST` — Your Qlik Cloud tenant host
- `QLIK_CLIENT_ID` — OAuth client ID for anonymous access
- `QLIK_ACCESS_CODE` — Access code for the anonymous app share
- `QLIK_APP_ID` — The Qlik Sense app ID to embed

### 2. Qlik Sense App Workflows

There are two workflows for working with Qlik Sense apps in this repository:

- **Workflow: `.github/workflows/qlik_app_deploy.yml`**
  - **Purpose:** Deploys (uploads and publishes) Qlik Sense apps from `src/*.qvf` to your Qlik Cloud tenant for consumption via the embed page.
  - **Triggers:** On push to `main` affecting `src/*.qvf`, or manually via workflow dispatch.
  - **Steps:**
    1. Installs dependencies
    2. Runs `embed/qlik-upload.js` to upload and publish the Qlik Sense app(s) to your tenant

- **Workflow: `.github/workflows/unbuild_app.yml`**
  - **Purpose:** Extracts ("unbuilds") the definition of each Qlik Sense app in `src/` into a `/diff` folder for version control and review. This does not deploy apps.
  - **Triggers:** On pull requests to `main` affecting `src/**`, or manually via workflow dispatch.
  - **Steps:**
    1. For each `.qvf` in `src/`, imports the app to a temporary Qlik Cloud context
    2. Runs `qlik app unbuild` to extract the app definition (without data) into `/diff/<qvf-name>/`
    3. Downloads any app images/media into `/diff/<qvf-name>/images/`
    4. Commits and pushes changes in `/diff` if any are detected

> **Note:** Use `qlik-app-deploy.yml` to deploy apps to your tenant. Use `unbuild_app.yml` to extract and version app definitions for code review and change tracking. The `/diff` folder is only updated by the unbuild workflow and is not used for deployment.

#### Required Repository Variables and Secrets:
- `QLIK_HOST` — Your Qlik Cloud tenant host
- `QLIK_ADMIN_CLIENT_ID` — Machine-to-machine OAuth client ID with `admin_classic` and `user_default` scopes
- `QLIK_ADMIN_CLIENT_SECRET` (Secret) —  Machine-to-machine OAuth client secret

---

## How to Configure Variables and Secrets

1. Go to your GitHub repository > Settings > Secrets and variables > Actions
2. Add the following **Variables**:
   - `QLIK_HOST`
   - `QLIK_CLIENT_ID`
   - `QLIK_ACCESS_CODE`
   - `QLIK_APP_ID`
   - `QLIK_ADMIN_CLIENT_ID`
3. Add the following **Secret**:
   - `QLIK_ADMIN_CLIENT_SECRET`

---

## Local Development

### Development Server (Recommended)
The project includes a build system that automatically replaces Qlik placeholders with environment variables, just like the GitHub workflow.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your Qlik environment variables using a `.env` file:
   ```bash
   # Copy the template file
   cp .env.template .env
   
   # Edit .env with your actual Qlik Cloud values
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   - Main app: http://localhost:3000

The server will automatically:
- Run the build process to replace Qlik placeholders
- Serve files from the `build/` directory
- Use fallback values if environment variables aren't set

### Build Process
The build system:
- Copies all files from `embed/` to `build/`
- Replaces `{{qlikHost}}`, `{{qlikClientId}}`, `{{qlikAccessCode}}`, and `{{qlikAppId}}` placeholders
- Uses environment variables if available, otherwise falls back to placeholder values
- Can be run independently with `npm run build`

### Manual File Access (Not Recommended)
You can still open `embed/index.html` directly in your browser, but you'll need to manually replace the Qlik placeholders for the charts to render properly.

---

## License

MIT License. See [LICENSE](LICENSE).

---

## Tests

This repository includes automated visual regression tests using Playwright. These tests ensure that the Qlik Sense charts render correctly and match the expected visual output.

### Running the Tests

1. Install dependencies:
   ```bash
   npm install --no-save @playwright/test playwright
   npx playwright install --with-deps
   ```

2. Run the tests:
   ```bash
   npx playwright test
   ```

### Test Details

- The tests navigate to the hosted Qlik Sense app and verify the presence of key elements.
- Visual regression checks are performed on the `.main-container` to ensure it matches the baseline image.
- Timeout for rendering elements is set to 15 seconds to accommodate iframe loading delays.
