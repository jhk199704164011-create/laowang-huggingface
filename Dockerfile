FROM node:20

WORKDIR /app
COPY . .

# 安装基础依赖
RUN apt-get update && apt-get install -y bash openssl curl && \
    npm install

EXPOSE 7860

CMD ["node", "index.js"]
