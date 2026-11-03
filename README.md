# Intelligent Virtual Gallery

A full-stack virtual art gallery built with **Next.js, React, TypeScript, PostgreSQL, and Prisma**. The application allows users to explore artworks, save favorites, receive personalized recommendations, and interact with a digital art collection. It also includes role-based content management, Cloudinary image hosting, user activity tracking, and an administrative analytics dashboard.

## Features

### Digital Art Gallery
- Browse a collection of artworks with paginated loading.
- Search artworks by title, description, artist, and category.
- View detailed artwork information and images.
- Explore artwork metadata, including artist, year, category, and tags.

### User Authentication and Roles
- User registration and login with email and password.
- Password hashing using `bcryptjs`.
- JWT-based authentication stored in HTTP-only cookies.
- Role-based access control with three roles:
  - **USER** – browse artworks, manage favorites, and receive recommendations.
  - **CURATOR** – create and edit artworks.
  - **ADMIN** – manage artworks, delete content, and access analytics.

### Favorites and Activity Tracking
- Add and remove artworks from a personal favorites collection.
- Track user interactions, including artwork views, likes, unlikes, and searches.
- Store interaction history in PostgreSQL for recommendation and analytics purposes.

### Personalized Recommendation System
The application includes a recommendation engine that analyzes user preferences and interaction history to suggest relevant artworks.

The recommendation algorithm considers:
- Favorite artworks and their tags.
- Artistic categories and recurring themes.
- Artwork views and likes.
- Removed favorites (unlikes).
- Search activity and matching keywords.

Different interaction types have different weights, allowing the system to estimate user preferences and calculate recommendation scores.

The system also introduces a randomized exploration factor to provide variety and encourage users to discover new artworks.

A featured recommendation includes a **Curator's Note**, explaining its relevance through matching artistic styles, colors, categories, and thematic elements.

### Admin Analytics Dashboard
Administrators can access a dedicated analytics dashboard featuring:
- Total artwork views, likes, unlikes, searches, and recorded events.
- Top artworks ranked by an engagement score.
- Charts showing views, likes, and unlikes.
- Most frequent search terms.
- Popular artwork categories.
- Most active users based on recorded interactions.

Analytics visualizations are implemented using **Recharts**.

### Image Hosting
- Upload artwork images directly to Cloudinary.
- Store secure image URLs in the database.
- Generate optimized thumbnail URLs for faster image loading.
- Import artwork metadata and images from a CSV dataset using a dedicated script.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Next.js App Router API Routes |
| Database | PostgreSQL 15 |
| ORM | Prisma 6 |
| Authentication | JWT, jose, bcryptjs |
| Image Hosting | Cloudinary |
| Recommendations | Custom weighted scoring algorithm |
| Analytics | Recharts |
| Notifications | React Hot Toast |
| Containerization | Docker, Docker Compose |
| Code Quality | ESLint 9 |

## Project Structure

```text
.
├── prisma/
│   └── schema.prisma
├── public/
├── scripts/
│   └── import-with-cloudinary.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics/
│   │   │   ├── artworks/
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── favorites/
│   │   │   ├── recommendations/
│   │   │   └── upload/
│   │   ├── analytics/
│   │   ├── artwork/
│   │   ├── dashboard/
│   │   ├── favorites/
│   │   ├── gallery/
│   │   ├── login/
│   │   ├── recommendations/
│   │   └── register/
│   ├── components/
│   └── lib/
├── artworks.csv
├── docker-compose.yml
├── Dockerfile
├── middleware.ts
└── package.json
```

## Database

The application uses **PostgreSQL** with Prisma ORM.

The database schema includes the following main models:

- **User** – user accounts, credentials, and roles.
- **Artwork** – artwork information, image URLs, categories, tags, and relationships.
- **Gallery** – gallery collections.
- **Exhibition** – exhibition information and associated artworks.
- **Favorite** – relationships between users and their favorite artworks.
- **UserEvent** – recorded user interactions used for recommendations and analytics.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 20 or later
- npm
- Docker Desktop or Docker Engine with Docker Compose
- A Cloudinary account for image uploads

### Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ivg_db"

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=ivg_db

JWT_SECRET=your_secure_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the example values with your actual database credentials, JWT secret, and Cloudinary credentials.

### Running with Docker Compose

The project includes Docker Compose configuration for running the application, PostgreSQL database, and Prisma Studio.

Start the services with:

```bash
docker compose up --build
```

The application runs at:

- **Web application:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555
- **PostgreSQL:** localhost:5432

To stop the services:

```bash
docker compose down
```

To stop the services and remove the database volume as well:

```bash
docker compose down -v
```

**Note:** The Compose configuration mounts the project directory into the application container and runs the Next.js development server. The separate Dockerfile also defines a multi-stage production-oriented image.

### Running Locally Without Docker

Install the dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Make sure PostgreSQL is running and the `DATABASE_URL` variable points to your database. Apply the Prisma schema using the migration files included in the project, or synchronize the schema with:

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma studio` | Open the Prisma database management interface |

## Artwork Import

The repository includes an `artworks.csv` dataset and a script for importing artwork records and uploading their images to Cloudinary.

The import script is located at:

```text
scripts/import-with-cloudinary.ts
```

It reads artwork metadata from the CSV file, uploads the image files to the Cloudinary `artworks` folder, and stores the resulting image URLs and artwork information in PostgreSQL.

## Security and Access Control

- Passwords are hashed before being stored.
- Authentication tokens are stored in HTTP-only cookies.
- Protected routes require a valid JWT.
- Administrative pages and content-management operations enforce role-based access restrictions.
- Cloudinary credentials and database connection details are configured through environment variables.

## License

This project was developed as an academic project. No separate open-source license is specified.
