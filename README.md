SSLStickerStore 

Collect, Organize, and Trade. The premier destination for sticker enthusiasts.

SSLStickerStore is a full-stack web application designed for digital (or physical) sticker collecting. It features a robust inventory system allowing users to organize their collections into folders, a secure user-to-user trading platform, and a comprehensive marketplace.

Built with a focus on performance and type safety, leveraging Vite + React (TypeScript) on the frontend and Ruby on Rails with MySQL on the backend.

Tech Stack

Frontend

Framework: React

Build Tool: Vite

Language: TypeScript
* Styling: CSS Modules / Tailwind CSS (Adjust based on your actual styling preference)

State Management: React Context / Hooks

Backend

Framework: Ruby on Rails (API Mode)

Database: MySQL

ORM: ActiveRecord

Key Features

User Folders & Inventory:

Organize stickers into custom collections and binders.

Sort by rarity, acquisition date, or category.

Secure P2P Trading:

Trade Proposals: Users can propose trades (e.g., "My Holo-Cat for your Neon-Dog").

Live Status: Track trade offers (Pending, Accepted, Rejected).
* Transactional Integrity: Ensuring items are locked during trade negotiations.

The Store:

Purchase sticker packs or individual limited edition items.

User Profiles:

Showcase your collection to the community.

Track trade reputation and history.

Getting Started

Follow these instructions to set up the project locally for development.

Prerequisites

Node.js (v18.0.0 or higher)

Ruby (v3.0.0 or higher)

MySQL Server running locally

1. Clone the Repository


2. Backend Setup (Rails)

Navigate to the backend directory (assuming a server or api folder structure, otherwise run in root):

cd backend

# Install Ruby Gems
bundle install

# Setup Database (Create and Migrate)
rails db:create
rails db:migrate

# Seed the database with initial stickers/users (optional)
rails db:seed

# Start the Rails Server
rails s


The API will typically run on http://localhost:3000

3. Frontend Setup (Vite + React)

Open a new terminal and navigate to the frontend directory:

cd frontend

# Install Dependencies
npm install
# or
yarn install

# Start the Development Server
npm run dev


The frontend will typically run on http://localhost:5173

Environment Variables

Create .env files in your respective directories based on the examples below.

Backend (top of stickerstore directory)

MYSQL_USERNAME=user
MYSQL_PASSWORD=pass
CLOUDINARY_ENV=key


Frontend (/front/front/.env)

VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME


Contributing

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

License

Distributed under the MIT License. See LICENSE for more information.
