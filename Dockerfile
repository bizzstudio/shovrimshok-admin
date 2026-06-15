# שוברים שוק — Admin (Vite + React SPA)
# Multi-stage: build סטטי ואז הגשה דרך nginx.

# ---------- שלב build ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# משתני VITE_* "נצרבים" לתוך ה-bundle בזמן build — לכן הם build args.
ARG VITE_APP_API_BASE_URL
ARG VITE_APP_API_SOCKET_URL
ARG VITE_APP_STORE_DOMAIN
ARG VITE_APP_ENVIRONMENT
ENV VITE_APP_API_BASE_URL=$VITE_APP_API_BASE_URL \
    VITE_APP_API_SOCKET_URL=$VITE_APP_API_SOCKET_URL \
    VITE_APP_STORE_DOMAIN=$VITE_APP_STORE_DOMAIN \
    VITE_APP_ENVIRONMENT=$VITE_APP_ENVIRONMENT

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- שלב run ----------
FROM nginx:alpine AS run
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
