
ARG NODE_VERSION=24.14.0

# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine 

# Set working directory for all build stages.
WORKDIR /app


# Copy package.json so that package manager commands can be used.
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN npm run build


# Expose the port that the application listens on.
EXPOSE 6002

# Run the application.
CMD ["npm", "run", "start"]
