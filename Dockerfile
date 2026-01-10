FROM node:20

WORKDIR /app

# 复制当前目录下所有文件
COPY . .

# 安装基础依赖
RUN apt-get update && apt-get install -y bash openssl curl && \
    npm install

# 开放端口
EXPOSE 7860

# 运行主程序
CMD ["node", "index.js"]
