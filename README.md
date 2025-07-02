# qlik-sense-charts

A simple app, with all charts, hosted in GitHub pages via Qlik anonymous access.

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

The embed app uses Qlik's web components to display a Qlik Sense app in a modern, responsive UI. It requires several Qlik Cloud variables to be injected at build/deploy time:

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

### Option 1: Direct File Access
You can preview the embed app locally by opening `embed/index.html` in your browser, but you must manually replace the `{{qlikHost}}`, `{{qlikClientId}}`, `{{qlikAccessCode}}`, and `{{qlikAppId}}` placeholders with your actual values.

### Option 2: Local Development Server (Recommended)
For a better development experience, use the included Node.js development server:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   node server.js
   ```

3. Open your browser and navigate to:
   - Main app: http://localhost:3000
   - Dual chart config: http://localhost:3000/dual-chart-config
   - Solo classic app: http://localhost:3000/solo-classic-app

The server will serve all files from the `embed/` directory and provide helpful console output with available routes and placeholder information.

**Note:** You'll still need to manually replace the Qlik placeholders in the HTML files with your actual values for the charts to render properly.

---

## License

MIT License. See [LICENSE](LICENSE).

---

## References
- [Qlik Embed Web Components](https://qlik.dev/embed/web-components/)
- [Qlik API JS SDK](https://qlik.dev/apis/javascript/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

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
