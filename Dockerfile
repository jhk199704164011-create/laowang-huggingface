FROM node:20
WORKDIR /app
COPY . .
# Debian 系统必须用 apt-get
RUN apt-get update && apt-get install -y bash openssl curl && npm install
EXPOSE 7860
CMD ["node", "index.js"]
