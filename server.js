require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// node-fetch dynamic  import
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

//  RAM memory
let history = [];

/**
 * Cohere's or mock generation of post title and content in JSON format
 */
const mockCallCount = {};

const useMock = process.env.MOCK === 'true';

async function generatePostWithCohereOrMock(keyword) {
  if (useMock) {
    // Mock zwracający unikalne posty
    if (!mockCallCount[keyword]) mockCallCount[keyword] = 0;
    mockCallCount[keyword]++;
    return {
      title: `Mock AI generated title about ${keyword} #${mockCallCount[keyword]}`,
      content: `This is mock AI-generated blog post about: ${keyword} (version ${mockCallCount[keyword]}).`
    };
  } else {

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const response = await fetch("https://api.cohere.ai/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.COHERE_TOKEN}`,
          "Content-Type": "application/json",
          "Cohere-Version": "2022-12-06"
        },
        body: JSON.stringify({
          model: "command",
          max_tokens: 400,
          prompt: `
Generate a blog post based on the following topic keyword: "${keyword}".
Return ONLY a valid JSON object with fields "title" and "content".
"content" must be concise and fully related to the "title".

Example output:

{
  "title": "<a catchy blog post title, max 50 characters, MUST include the keyword in the text>",
  "content": "<an engaging blog post content, max 600 characters, MUST include the keyword in the text>"
}

Make sure JSON is complete and properly formatted.
          `
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error("Cohere API error: " + err);
      }

      const data = await response.json();
      const text = data?.generations?.[0]?.text ?? "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const jsonStr = jsonMatch;
      const parsed = JSON.parse(jsonStr);

      if (!parsed.title || !parsed.content) {
        throw new Error("AI response missing title or content");
      }

      return { title: parsed.title, content: parsed.content };

    } catch (e) {
      console.error(`Attempt ${attempt} failed: ${e.message}`);
      if (attempt >= maxRetries) throw new Error("Max retries reached: " + e.message);
      await new Promise(r => setTimeout(r, 1000)); // short delay before retry
    }
  }
  }
}

const MAX_KEYWORD_LENGTH = 50;
const MAX_BLOG_LENGTH = 6000;

/**
 * Generate new post
 */
app.post('/generate', async (req, res) => {
  const { keyword, tags = [] } = req.body;

  if (!keyword || keyword.trim() === '') {
    return res.status(400).json({ error: 'Missing keyword.' });
  }
  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return res.status(400).json({ error: `Keyword length must not exceed ${MAX_KEYWORD_LENGTH} characters.` });
  }

  try {
    const { title, content } = await generatePostWithCohereOrMock(keyword.trim());

    if (content.length > MAX_BLOG_LENGTH) {
      return res.status(400).json({ error: `Generated content exceeds maximum allowed (${MAX_BLOG_LENGTH} characters).` });
    }

    const timestamp = new Date().toISOString();
    const id = uuidv4();

    const entry = {
      id,
      keyword: keyword.trim(),
      title: title.trim(),
      blog: content.trim(),
      timestamp,
      tags: tags.map(t => t.toLowerCase())
    };

    history.push(entry);
    res.json(entry);

  } catch (e) {
    console.error('Error generating post:', e);
    res.status(500).json({ error: 'Error generating the post.' });
  }
});

/**
 *  History retrieval with optional filtering
 */
app.get('/history', (req, res) => {
  let { page = 1, pageSize = 2, search = '', tag = '', sort = 'newest' } = req.query;
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  let filtered = history;

  if (search) {
    filtered = filtered.filter(
      e => e.keyword.toLowerCase().includes(search.toLowerCase())
        || e.blog.toLowerCase().includes(search.toLowerCase())
        || e.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (tag) {
    filtered = filtered.filter(e => e.tags.includes(tag.toLowerCase()));
  }

  if (sort === 'newest') {
    filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else if (sort === 'oldest') {
    filtered = filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  res.json({ total, page, pageSize, items: paginated });
});

/**
 * Delete post
 */
app.delete('/history/:id', (req, res) => {
  const { id } = req.params;
  const index = history.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  history.splice(index, 1);
  res.json({ message: 'Post deleted.', id });
});

/**
 * Update post
 */
app.put('/history/:id', (req, res) => {
  const { id } = req.params;
  const { keyword, blog, tags, title } = req.body;
  const entry = history.find(e => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  if (keyword && keyword.length > MAX_KEYWORD_LENGTH) {
    return res.status(400).json({ error: `Keyword length must not exceed ${MAX_KEYWORD_LENGTH} characters.` });
  }
  if (blog && blog.length > MAX_BLOG_LENGTH) {
    return res.status(400).json({ error: `Blog length must not exceed ${MAX_BLOG_LENGTH} characters.` });
  }
  if (title && title.trim().length < 3) {
    return res.status(400).json({ error: "Title must be at least 3 characters long." });
  }

  if (keyword) entry.keyword = keyword.trim();
  if (title) entry.title = title.trim();
  if (blog) entry.blog = blog.trim();
  if (tags) entry.tags = tags.map(t => t.toLowerCase());

  res.json({ message: 'Post updated.', entry });
});

/**
 * Download unique tags
 */
app.get('/tags', (req, res) => {
  const uniqueTags = [...new Set(history.flatMap(entry => entry.tags))];
  res.json(uniqueTags);
});

/**
 * Test Reset: Remove post history
 */
app.post('/test-reset', (req, res) => {
  history = []; 
  res.json({ message: 'History cleared.' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
