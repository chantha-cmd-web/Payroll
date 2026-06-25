import { getAccessToken } from './googleAuth';

const APP_DATA_FILENAME = 'cambodia_payroll_backup.json';

export async function backupDataToDrive(data: any): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  // Find if file already exists
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${APP_DATA_FILENAME}' and trashed=false&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const searchData = await searchRes.json();
  const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

  const fileContent = JSON.stringify(data, null, 2);
  const metadata = {
    name: APP_DATA_FILENAME,
    mimeType: 'application/json'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';

  if (existingFile) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
    method = 'PATCH';
  }

  const uploadRes = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to backup to Google Drive');
  }
}

export async function restoreDataFromDrive(): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${APP_DATA_FILENAME}' and trashed=false&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const searchData = await searchRes.json();
  const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

  if (!existingFile) {
    throw new Error('No backup found on Google Drive');
  }

  const downloadRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!downloadRes.ok) {
    throw new Error('Failed to download backup from Google Drive');
  }

  return await downloadRes.json();
}

export async function exportReportToDrive(filename: string, content: string, mimeType: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const metadata = {
    name: filename,
    mimeType: mimeType
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const method = 'POST';

  const uploadRes = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to export to Google Drive');
  }
}
