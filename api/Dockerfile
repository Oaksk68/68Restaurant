FROM php:8.4-cli

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install \
    pcntl \
    pdo \
    pdo_pgsql \
    mbstring \
    xml \
    curl \
    zip \
    bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-dev --optimize-autoloader

CMD chmod +x reverb-start.sh && ./reverb-start.sh