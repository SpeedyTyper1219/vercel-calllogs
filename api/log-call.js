import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Now destructuring "name" from the request body
  const { number, name, duration, status, timestamp } = req.body;

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:F", // Expanded range to A:F for 6 columns
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date(parseInt(timestamp)).toLocaleString(),
            number,
            name || "Unknown", // The new Contact Name column
            status,
            duration,
            "Android Emulator",
          ],
        ],
      },
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
