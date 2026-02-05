FROM node:20-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy Python requirements
COPY ai_engine/requirements.txt ./ai_engine/

# Install Python dependencies
# We use --break-system-packages because we are in a container and want to utilize the system python
RUN pip3 install --no-cache-dir -r ai_engine/requirements.txt --break-system-packages

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
