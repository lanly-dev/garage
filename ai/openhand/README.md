# OpenHands (Agent Canvas)

Run OpenHands Agent Canvas locally with Docker.

## Start

```bash
docker compose up -d
```

Open:

```text
http://localhost:2222/canvas
```

## Stop

```bash
docker compose down
```

## Notes

- Uses the `ghcr.io/openhands/agent-canvas` Docker image
- Exposes port `2222` on the host and maps to container port `8000`
- Mounts the current folder into the container's `/projects` so the agent can access it
- Saves settings/state in `~/.openhands`
- Restarts automatically unless stopped

## Logs

```bash
docker compose logs -f openhands
```

# NOTES:
it doesn't seem the app has any good support to connect to ollama to run local llm.
