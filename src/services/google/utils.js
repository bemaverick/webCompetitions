export function detectGoogleSheetLink(url) {
  try {
    const googleSheetRegex = /(https?:\/\/(?:docs\.google\.com\/spreadsheets\/d\/)([a-zA-Z0-9_-]+)(?:\/[^#?]+)?(?:[?#].*)?)/;

    const match = url.match(googleSheetRegex);
    console.log('match', match, url)

    if (match && match[1]) {
      return match[1]; // Returns the full matched URL
    } else {
      return null; // No Google Sheet link found
    }
  } catch (error) {
    return null;
  }
}

export function extractGoogleSheetId(url) {
  try {
    const regex = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);

    if (match && match[1]) {
      return match[1]; // The captured group contains the ID
    } else {
      return null; // No Google Sheet ID found
    }
  } catch (error) {
    return null;
  }
}

