# syntax=docker/dockerfile:1

ARG RUBY_VERSION=3.4.7
FROM ruby:$RUBY_VERSION-slim AS base

# Rails app location
WORKDIR /rails

# Install runtime dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl libjemalloc2 libvips sqlite3 && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Set environment variables
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test" \
    LANG=C.UTF-8 \
    TZ=UTC

# -------------------------
# Build stage (to reduce final image size)
# -------------------------
FROM base AS build

# Install build dependencies for gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy Gemfiles first for caching
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install --jobs 4 --retry 3

# Remove leftover git directories to shrink image
RUN find /usr/local/bundle/ruby -name ".git" -type d -exec rm -rf {} +

# Copy app code
COPY . .

# Precompile bootsnap (safe)
RUN mkdir -p tmp/cache && \
    bundle exec bootsnap precompile app/ lib/ || true

# -------------------------
# Final production image
# -------------------------
FROM base

# Copy gems from build stage
COPY --from=build /usr/local/bundle /usr/local/bundle

# Copy application code
COPY --from=build /rails /rails

# Create non-root user
RUN groupadd --system --gid 1000 rails && \
    useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash rails && \
    chown -R rails:rails db log storage tmp

USER rails

# Entrypoint for DB prep
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Default command
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
