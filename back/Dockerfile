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
# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Yarn without apt-key
# Install Node.js 20 and Yarn safely
# Install Node.js 20 and Yarn safely from Debian repos
# Install Node 20 + Yarn without apt repos
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends curl xz-utils gnupg ca-certificates default-mysql-client && \
    rm -rf /var/lib/apt/lists/* && \
    \
    # Install Node 20
    curl -fsSL https://nodejs.org/dist/v20.20.0/node-v20.20.0-linux-x64.tar.xz \
        | tar -xJ -C /usr/local --strip-components=1 && \
    \
    # Install Yarn 1.x (classic)
    curl -fsSL https://classic.yarnpkg.com/latest.tar.gz | tar -xzf - -C /opt && \
    ln -s /opt/yarn-v1.22.21/bin/yarn /usr/local/bin/yarn

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

RUN gem install bundler
RUN bundle install --jobs 4 --retry 3

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
    chown -R rails:rails /rails

USER 1000:1000


# Entrypoint and CMD
# Start the application server
ENV PORT=3000
ENV RAILS_ENV=production
ENV RACK_ENV=production

CMD bundle exec rails s -b 0.0.0.0 -p ${PORT:-3000}
