// AniList GraphQL API Service

export const searchAnimeByTitle = async (title) => {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            native
            
          }
          description(asHtml: false)
          coverImage {
            large
            medium
          }
          bannerImage
          genres
          averageScore
          status
          episodes
          studios {
            nodes {
              name
            }
          }
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  const variables = { search: title };

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }

    return data.data.Page.media;
  } catch (error) {
    console.error('AniList API Error:', error);
    return [];
  }
};

// Helper function to clean HTML tags from description
export const cleanDescription = (description) => {
  if (!description) return '';
  // Remove HTML tags and decode HTML entities
  return description
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .trim();
};

// Helper function to get preferred title
export const getPreferredTitle = (titleObj) => {
  return titleObj.english || titleObj.romaji || titleObj.native || 'Unknown Title';
};