# Setup

1. Copy `.env.example` to `.env`  
2. Fill in the environment variables with your own keys (e.g. `COHERE_TOKEN`)  
3. Run the application  

---

## Running Tests

You can run the Playwright tests in two modes:

- **Using Cohere AI (real post generation):**  
  This mode relies on the real Cohere API to generate posts.  
  Make sure your `.env` file contains a valid `COHERE_TOKEN`.  
  Run tests with:  
```bash
npm run test
```

  - **Using Mock Mode (no external API calls):**  
This mode uses mock data to simulate post generation without calling the Cohere API. It speeds up tests and makes them independent of external services.  
Run tests with: 
```bash
  npm run test:mock
```

*(On Windows (cmd), this runs with environment variable `MOCK=true` set)*  
Or in PowerShell: 
```bash
   $env:MOCK="true"; npx playwright test
```

## Example Scripts in `package.json`:
```bash
"scripts": {
"test": "npx playwright test",
"test:mock": "set MOCK=true&& npx playwright test"}
```
---

This setup gives you flexibility to switch between real AI generation and mocks depending on your development or CI needs.