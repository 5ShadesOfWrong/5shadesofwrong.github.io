# Dockerfile — portable deployment of the site (user review 2026-10-26)
#
# Purpose: run the site anywhere Docker runs — e.g. on a local device for
# fairs/events with weak network, independent of GitHub Pages.
#
# Build (from the repository root):
#   docker build -t shades-page .
#
# Run:
#   docker run --rm -p 4321:4321 shades-page
#   → http://localhost:4321
#
# The site is fully static: this image only serves the built files.

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (layer caching: rebuilds skip this when
# package*.json are unchanged)
COPY site/package.json site/package-lock.json ./
RUN npm ci

# Copy sources and build
COPY site/ ./
RUN npm run build

# ---- Serve stage ----
FROM node:22-alpine
WORKDIR /app
RUN npm install --global serve

COPY --from=build /app/dist ./dist

EXPOSE 4321
# `serve` handles SPA-style routing and correct MIME types
CMD ["serve", "-l", "4321", "dist"]
