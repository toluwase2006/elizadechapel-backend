# Elizade Chapel Backend

Express and MongoDB API for publishing Chapel Bible Study and Proverbial Digest content.

## Run locally

Create a `.env` file with:

```env
MONGO_URI=mongodb+srv://...
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

Then run:

```bash
npm install
npm start
```

## API

- `GET /api/health`
- `GET /api/content/bible-study`
- `POST /api/content/bible-study`
- `DELETE /api/content/bible-study/:id`
- `GET /api/content/proverbial-digest`
- `POST /api/content/proverbial-digest`
- `DELETE /api/content/proverbial-digest/:id`

Each POST accepts JSON matching the dashboard records. Bible Study requires `day`, `time`, `title`, `scripture`, `summary`, `documentName`, and `documentDataUrl`. Digest requires `day`, `proverb`, `reflection`, `documentName`, and `documentDataUrl`. The `documentDataUrl` is uploaded to Cloudinary; responses return its hosted URL in `documentDataUrl` for frontend compatibility.
