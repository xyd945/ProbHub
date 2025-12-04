# Testing the Ingestion Pipeline

The complete pipeline is now built! Here's how to test it:

## Manual Test

Run the ingestion manually:

```bash
curl -X POST http://localhost:3000/api/ingest/hackernews
```

This will:
1. Fetch 20 recent Ask HN posts
2. Filter those with score >= 3 and text content
3. Send each to the LLM (Deepseek) for normalization
4. Insert problems into the database
5. Create tags automatically

**Expected output:**
```json
{
  "source": "hackernews",
  "fetched": 20,
  "processed": 5-15,
  "errors": 0,
  "startedAt": "2024-12-04...",
  "completedAt": "2024-12-04..."
}
```

## Check Results

After ingestion, verify the data:

```bash
# List problems
curl http://localhost:3000/api/problems

# List tags
curl http://localhost:3000/api/tags

# Search problems
curl "http://localhost:3000/api/problems?q=authentication"
```

## Monitor Logs

Watch the terminal running `npm run dev` to see detailed logs:
- `[HN Connector]` - Fetching stories
- `[Normalizer]` - LLM processing
- `[LLM]` - Token usage
- `[Ingestion]` - Pipeline progress

## Cost Estimate

**Deepseek pricing** (as of Dec 2024):
- ~$0.14 per 1M input tokens
- ~$0.28 per 1M output tokens

Processing 20 stories with ~2000 tokens each:
- Input: ~40K tokens = $0.006
- Output: ~10K tokens = $0.003
- **Total: ~$0.01 per run** 💰

## Troubleshooting

If you see errors:

1. **"LLM_API_KEY not set"** → Add your Deepseek API key to `.env`
2. **"isProblem: false"** → Normal, LLM filtered out non-problems
3. **Rate limit errors** → The connector has built-in delays
4. **JSON parse errors** → LLM response format issue, will retry

Ready to test! 🚀
