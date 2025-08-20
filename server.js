require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

let history = [];


async function generateBlogWithCohere(keyword) {
   // return `This is a mock blog post about: ${keyword}. This text is returned as a static response for testing purposes.`;
  const COHERE_TOKEN = process.env.COHERE_TOKEN;
  if (!COHERE_TOKEN) {
    throw new Error('Missing COHERE_TOKEN environment variable');
  }
  const response = await fetch(
    "https://api.cohere.ai/generate",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_TOKEN}`,
        "Content-Type": "application/json",
        "Cohere-Version": "2022-12-06"
      },
      body: JSON.stringify({
        model: "command",  
        prompt: `Write a blog post about: ${keyword} that is strictly no longer than 60 words.`,
        max_tokens: 100
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cohere API error:', response.status, errorText);
    throw new Error('Failed to generate blog post');
  }

  const data = await response.json();
  console.log('Cohere API response:', data);
  return data?.generations?.[0]?.text ?? "No response from Cohere.";
}


const MAX_KEYWORD_LENGTH = 100;
const MAX_BLOG_LENGTH = 5000;

app.post('/generate', async (req, res) => {
  const { keyword, tags = [] } = req.body;
  if (!keyword || keyword.trim() === '') {
    return res.status(400).json({ error: 'Missing keyword.' });
  }
  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return res.status(400).json({ error: `Keyword length must not exceed ${MAX_KEYWORD_LENGTH} characters.` });
  }
  try {
    const blog = await generateBlogWithCohere(keyword.trim());

if (blog.length > MAX_BLOG_LENGTH) {
      return res.status(400).json({ error: `Generated blog length exceeds maximum allowed (${MAX_BLOG_LENGTH} characters).` });
    }


    const timestamp = new Date().toISOString();
    const id = uuidv4();
    const entry = { id, keyword: keyword.trim(), blog, timestamp, tags: tags.map(t => t.toLowerCase()) };
    history.push(entry);
    res.json(entry);
  } catch (e) {
    console.error('Error generating post:', e);
    res.status(500).json({ error: 'Error generating the post.' });
  }
});

// Get history with optional query filtering and pagination
app.get('/history', (req, res) => {
  let { page = 1, pageSize = 2, search = '', tag = '', sort = 'newest' } = req.query;
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  let filtered = history;

  if (search) {
    filtered = filtered.filter(
      e => e.keyword.toLowerCase().includes(search.toLowerCase())
        || e.blog.toLowerCase().includes(search.toLowerCase())
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


app.delete('/history/:id', (req, res) => {
  const { id } = req.params;
  const index = history.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  history.splice(index, 1);
  res.json({ message: 'Post deleted.', id });
});

// Update post (keyword, blog, tags)
app.put('/history/:id', (req, res) => {
  const { id } = req.params;
  const { keyword, blog, tags } = req.body;
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

  if (keyword) entry.keyword = keyword;
  if (blog) entry.blog = blog;
  if (tags) entry.tags = tags.map(t => t.toLowerCase());
  res.json({ message: 'Post updated.', entry });
});

app.get('/tags', (req, res) => {

  const uniqueTags = [...new Set(history.flatMap(entry => entry.tags))];
  res.json(uniqueTags);
});
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
