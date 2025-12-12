/**
 * Google Services
 * Handles OAuth, Gmail, Drive, Docs, and Sheets
 */

// OAuth configuration (users will need to create their own Google Cloud project)
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
];

export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  isConnected?: boolean;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ===========================================
// TOKEN MANAGEMENT
// ===========================================

let cachedTokens: GoogleTokens | null = null;

export async function refreshAccessToken(
  credentials: GoogleCredentials
): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();

  cachedTokens = {
    accessToken: data.access_token,
    refreshToken: credentials.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

async function getAccessToken(credentials: GoogleCredentials): Promise<string> {
  if (cachedTokens && cachedTokens.expiresAt > Date.now() + 60000) {
    return cachedTokens.accessToken;
  }
  return refreshAccessToken(credentials);
}

// ===========================================
// GMAIL SERVICE
// ===========================================

export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: Date;
  snippet: string;
  body?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export async function listEmails(
  credentials: GoogleCredentials,
  query = "",
  maxResults = 20
): Promise<Email[]> {
  const token = await getAccessToken(credentials);

  const searchParams = new URLSearchParams({
    maxResults: maxResults.toString(),
  });
  if (query) searchParams.set("q", query);

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${searchParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to list emails");
  }

  const data = await response.json();
  const messages = data.messages || [];

  // Fetch details for each message
  const emails: Email[] = await Promise.all(
    messages.map(async (msg: { id: string }) => {
      const detail = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const messageData = await detail.json();
      return parseEmail(messageData);
    })
  );

  return emails;
}

function parseEmail(data: any): Email {
  const headers = data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
      ?.value || "";

  return {
    id: data.id,
    threadId: data.threadId,
    from: getHeader("from"),
    to: getHeader("to"),
    subject: getHeader("subject"),
    date: new Date(parseInt(data.internalDate)),
    snippet: data.snippet,
  };
}

export async function searchEmails(
  credentials: GoogleCredentials,
  from?: string,
  subject?: string,
  after?: Date
): Promise<Email[]> {
  const queryParts: string[] = [];

  if (from) queryParts.push(`from:${from}`);
  if (subject) queryParts.push(`subject:${subject}`);
  if (after) {
    const dateStr = after.toISOString().split("T")[0].replace(/-/g, "/");
    queryParts.push(`after:${dateStr}`);
  }

  return listEmails(credentials, queryParts.join(" "));
}

export async function sendEmail(
  credentials: GoogleCredentials,
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<string> {
  const token = await getAccessToken(credentials);

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: ${html ? "text/html" : "text/plain"}; charset=utf-8`,
    "",
    html || body,
  ].join("\r\n");

  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send email");
  }

  const data = await response.json();
  return data.id;
}

// ===========================================
// GOOGLE DRIVE SERVICE
// ===========================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: Date;
  modifiedTime: Date;
  webViewLink?: string;
  parents?: string[];
}

export async function listFiles(
  credentials: GoogleCredentials,
  folderId?: string,
  query?: string
): Promise<DriveFile[]> {
  const token = await getAccessToken(credentials);

  const queryParts: string[] = ["trashed = false"];
  if (folderId) queryParts.push(`'${folderId}' in parents`);
  if (query) queryParts.push(query);

  const params = new URLSearchParams({
    q: queryParts.join(" and "),
    fields: "files(id,name,mimeType,createdTime,modifiedTime,webViewLink,parents)",
    pageSize: "100",
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error("Failed to list files");
  }

  const data = await response.json();
  return (data.files || []).map((f: any) => ({
    ...f,
    createdTime: new Date(f.createdTime),
    modifiedTime: new Date(f.modifiedTime),
  }));
}

export async function downloadFile(
  credentials: GoogleCredentials,
  fileId: string
): Promise<string> {
  const token = await getAccessToken(credentials);

  // For Google Docs, export as plain text
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    // Try regular download for non-Google files
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!downloadResponse.ok) {
      throw new Error("Failed to download file");
    }

    return downloadResponse.text();
  }

  return response.text();
}

export async function createFolder(
  credentials: GoogleCredentials,
  name: string,
  parentId?: string
): Promise<DriveFile> {
  const token = await getAccessToken(credentials);

  const metadata: any = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create folder");
  }

  return response.json();
}

export async function uploadFile(
  credentials: GoogleCredentials,
  name: string,
  content: string,
  mimeType: string,
  folderId?: string
): Promise<DriveFile> {
  const token = await getAccessToken(credentials);

  const metadata: any = { name };
  if (folderId) metadata.parents = [folderId];

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", new Blob([content], { type: mimeType }));

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  return response.json();
}

// ===========================================
// GOOGLE DOCS SERVICE
// ===========================================

export async function createGoogleDoc(
  credentials: GoogleCredentials,
  title: string,
  content: string,
  folderId?: string
): Promise<DriveFile> {
  const token = await getAccessToken(credentials);

  // Create empty doc
  const createResponse = await fetch(
    "https://docs.googleapis.com/v1/documents",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!createResponse.ok) {
    throw new Error("Failed to create document");
  }

  const doc = await createResponse.json();

  // Insert content
  await fetch(
    `https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      }),
    }
  );

  // Move to folder if specified
  if (folderId) {
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${doc.documentId}?addParents=${folderId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  return {
    id: doc.documentId,
    name: title,
    mimeType: "application/vnd.google-apps.document",
    createdTime: new Date(),
    modifiedTime: new Date(),
    webViewLink: `https://docs.google.com/document/d/${doc.documentId}/edit`,
  };
}

// ===========================================
// GOOGLE SHEETS SERVICE
// ===========================================

export interface SheetData {
  values: string[][];
}

export async function readSheet(
  credentials: GoogleCredentials,
  spreadsheetId: string,
  range: string
): Promise<SheetData> {
  const token = await getAccessToken(credentials);

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error("Failed to read sheet");
  }

  const data = await response.json();
  return { values: data.values || [] };
}

export async function updateSheet(
  credentials: GoogleCredentials,
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<void> {
  const token = await getAccessToken(credentials);

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update sheet");
  }
}

export async function createSpreadsheet(
  credentials: GoogleCredentials,
  title: string,
  headers: string[],
  folderId?: string
): Promise<DriveFile> {
  const token = await getAccessToken(credentials);

  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [
          {
            properties: { title: "Sheet1" },
            data: [{ rowData: [{ values: headers.map((h) => ({ userEnteredValue: { stringValue: h } })) }] }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create spreadsheet");
  }

  const data = await response.json();

  // Move to folder if specified
  if (folderId) {
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${data.spreadsheetId}?addParents=${folderId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  return {
    id: data.spreadsheetId,
    name: title,
    mimeType: "application/vnd.google-apps.spreadsheet",
    createdTime: new Date(),
    modifiedTime: new Date(),
    webViewLink: data.spreadsheetUrl,
  };
}
