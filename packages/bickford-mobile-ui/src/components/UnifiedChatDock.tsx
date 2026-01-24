import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const SAMPLE_MESSAGES = [
  { id: "m1", author: "Operator", body: "Check the latest session queue." },
  { id: "m2", author: "Bickford", body: "Queued 3 sessions for review." },
];

export default function UnifiedChatDock() {
  const [message, setMessage] = React.useState("");

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 72,
        right: 16,
        width: 320,
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        Unified Chat
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        {SAMPLE_MESSAGES.map((chat) => (
          <Box key={chat.id} sx={{ bgcolor: "#f5f5f5", p: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {chat.author}
            </Typography>
            <Typography variant="body2">{chat.body}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Type a response..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <Button
          variant="contained"
          disabled={message.trim().length === 0}
          onClick={() => setMessage("")}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}
