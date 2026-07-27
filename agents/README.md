# Lore Agent Service

FastAPI + LangGraph agent service. See [../docs/01-architecture.md](../docs/01-architecture.md) for how this fits with the Next.js app, and [../docs/02-schema.md](../docs/02-schema.md) for the `/agents/turn` contract.

## Running locally

```bash
uv run uvicorn main:app --reload --port 8000
```

Requires `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` in the environment — `main.py` loads them from the repo-root `.env` automatically, so nothing extra to set up if that file exists.

Health check: `GET http://localhost:8000/health`
