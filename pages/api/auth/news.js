export default async function handler(req, res) {
  const { category = 'general' } = req.query;
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY}`,
      {
        headers: {
          'User-Agent': 'Personal-Dashboard/1.0'
        }
      }
    );
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
