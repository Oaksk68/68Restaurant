FROM php:8.4-cli-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libpq \
    curl \
    zip \
    unzip \
    git \
    oniguruma-dev

# Install PHP extensions including pcntl
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pcntl \
    bcmath \
    mbstring

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files first (for caching)
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy rest of the project
COPY . .

# Generate optimized autoload
RUN composer dump-autoload --optimize

# Make start scripts executable
RUN chmod +x start.sh reverb-start.sh

EXPOSE 8080

CMD ["./start.sh"]