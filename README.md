# Spotlight - Webinar Platform

This is a [Next.js](https://nextjs.org) project for hosting interactive webinars with real-time features.

## Getting Started

First, install dependencies:

```bash
npm install --legacy-peer-deps
```

Set up your environment variables by copying `.env.example` to `.env` and filling in the values:

```bash
cp .env.example .env
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

### Prerequisites

1. Set up your environment variables in Vercel dashboard
2. Ensure your database (Neon/PostgreSQL) is accessible from Vercel
3. Configure timezone settings

### Environment Variables

Make sure to set these environment variables in your Vercel dashboard:

```bash
# Timezone Configuration (Important for webinar scheduling)
TZ=UTC

# Database
DATABASE_URL=your_neon_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/callback
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/callback

# Application URL
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app

# Add other environment variables as needed...
```

### Build Configuration

The project includes a `vercel.json` file that configures:

- Build command with Prisma generation
- Install command with legacy peer deps
- API function timeout settings

### Timezone Handling

The application has been optimized to handle timezone differences between client and server:

1. **Date Storage**: Dates are stored in YYYY-MM-DD format to avoid timezone conversion issues
2. **Server Validation**: Includes a 5-minute buffer for webinar start time validation
3. **Client-side Protection**: Prevents selection of past dates in the UI

### Troubleshooting

If you encounter the "Webinar date and time can not be in the past" error in production:

1. Check that `TZ=UTC` is set in your environment variables
2. Verify your database connection is working
3. Check the server logs for timezone offset information

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Vercel Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) - deployment guide.
