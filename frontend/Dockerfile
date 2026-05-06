# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json .
RUN npm ci

# Copie le code source et build
COPY . .
RUN npm run build

# ---- Run stage ----
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Supprime le contenu par défaut de nginx
RUN rm -rf ./*

# Copie le build Vite
COPY --from=build /app/dist .

# Configuration nginx pour React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
