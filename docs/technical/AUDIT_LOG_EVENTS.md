# Audit Log Events for Agents

Use the enterprise audit log to understand agentic activity across your org. Apply the `actor:Copilot` filter to see agent sessions from the last 180 days.

## Key fields

| Field | Description | Example value |
| --- | --- | --- |
| `action` | The action performed by the agent, such as creating a pull request. | `pull_request.create` |
| `actor_is_agent` | Indicates whether the actor is an AI agent. This will always be `true` for agentic audit log events. | `true` |
| `agent_session_id` | A unique identifier linking to the specific agent session that generated the event. This field only appears when the event is the result of an agent session. | `012345a6-b7c8-9012-de3f-45gh678i9012` |
| `user` | The person who initiated the agentic event. | `octocat` |
