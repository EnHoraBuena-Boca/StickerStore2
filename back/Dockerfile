FROM ruby:3.4.7-slim AS base

WORKDIR /rails

# Install runtime dependencies for MySQL, Rails, and image processing
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      gnupg \
      ca-certificates \
      libjemalloc2 \
      sqlite3 \
      default-mysql-client \
      build-essential \
      libvips-dev \
      libssl-dev \
      zlib1g-dev \
      liblzma-dev \
      libxml2-dev \
      libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and Yarn
# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Yarn without apt-key
RUN curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarn-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/yarn-archive-keyring.gpg] https://dl.yarnpkg.com/debian/ stable main" \
    | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

# Set Rails production environment variables
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test"


# Build stage
FROM base AS build

# Install build dependencies for gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      git \
      libyaml-dev \
      pkg-config \
      default-libmysqlclient-dev \
      libssl-dev \
      zlib1g-dev \
      liblzma-dev \
      libxml2-dev \
      libxslt1-dev \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Install gems
COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v 2.6.16 && \
    bundle install --jobs 4 --retry 3

# Copy app code
COPY . .

# Precompile bootsnap for faster boot
RUN mkdir -p tmp/cache && \
    bundle exec bootsnap precompile app/ lib/

# Final image
FROM base

# Copy built gems and app
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /rails /rails

# Non-root user
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp
USER 1000:1000

# Entrypoint and CMD
ENTRYPOINT ["/rails/bin/docker-entrypoint"]
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
