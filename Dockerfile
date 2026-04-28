# ── Stage 1: build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir flask flask-cors psutil
COPY server/server.py .
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["python3", "server.py"]
