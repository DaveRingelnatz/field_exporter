# ---- Dependencies ----
FROM node:carbon AS build
WORKDIR /app
COPY . ./
COPY config-template.js ./config.js
RUN npm install

# --- Release with Alpine ----
FROM node:8.9.4-alpine AS release
WORKDIR /app
COPY --from=build /app ./
CMD ["node", "field_exporter.js"]
