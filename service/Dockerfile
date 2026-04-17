FROM mcr.microsoft.com/playwright:v1.54.2-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3200
ENV HOST=0.0.0.0

EXPOSE 3200

CMD ["node", "server.js"]
