# Environment Variables Setup

## OpenPhone API Configuration

Add the following to your `.env.local` file:

```bash
# OpenPhone API Configuration
OPENPHONE_API_KEY=7ghvjT0qojWqvqZKrjFqrYIqd4K67Lh7
OPENPHONE_PHONE_NUMBER_ID=2363058324
OPENPHONE_API_BASE=https://api.openphone.com/v1  # Optional, defaults to this

# Optional: Scheduler authentication (for scheduled job endpoints)
SCHEDULER_SECRET=your_random_secret_key_here
```

**Note**: The credentials above are already configured. Make sure they're in your `.env.local` file.

## Firebase Configuration

Your Firebase configuration should already be set up. If not, add:

```bash
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PROJECT_ID=your-project-id
```

## Notes

- The `.env.local` file is gitignored and should not be committed
- Restart your dev server after adding/updating environment variables
- For production, set these in your hosting platform's environment variable settings
