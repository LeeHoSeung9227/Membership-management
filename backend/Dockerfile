FROM node:18

WORKDIR /usr/src/app

# 시스템 패키지 업데이트 및 필요한 도구 설치
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# package.json과 package-lock.json만 먼저 복사
COPY package*.json ./

# 새로운 node_modules 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]