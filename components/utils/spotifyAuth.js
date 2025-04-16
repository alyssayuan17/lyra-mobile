// /utils/spotifyAuth.js
import { encode as btoa } from 'base-64';

export async function getAccessToken() {
  const clientId = 'YOUR_CLIENT_ID';
  const clientSecret = 'YOUR_CLIENT_SECRET';

  // Encode clientId and clientSecret in Base64:
  const encoded = btoa(`${clientId}:${clientSecret}`);

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error('Spotify Auth Error:', err);
    return null;
  }
}
