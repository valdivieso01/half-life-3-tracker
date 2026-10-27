FROM node:22-alpine

WORKDIR /app

# Copiamos package.json primero para aprovechar la caché de capas de Docker
COPY package*.json ./

RUN npm install

# Copiamos el resto del proyecto (excluyendo lo listado en .dockerignore)
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
