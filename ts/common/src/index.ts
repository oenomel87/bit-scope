import express, { Request, Response } from 'express';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import createServer from "./mcp/server";

const app = express();
app.use(express.json());

// Store transports by session ID
const transports: Record<string, SSEServerTransport> = {};

// SSE endpoint for establishing the stream
app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET request to /sse (establishing SSE stream)');

  try {
    // Create a new SSE transport for the client
    // The endpoint for POST messages is '/messages'
    const transport = new SSEServerTransport('/messages', res);

    // Store the transport by session ID
    const sessionId = transport.sessionId;
    transports[sessionId] = transport;

    // Set up onclose handler to clean up transport when closed
    transport.onclose = () => {
      console.log(`SSE transport closed for session ${sessionId}`);
      delete transports[sessionId];
    };

    // Connect the transport to the MCP server
    const server = createServer();
    await server.connect(transport);

    console.log(`Established SSE stream with session ID: ${sessionId}`);
  } catch (error) {
    console.error('Error establishing SSE stream:', error);
    if (!res.headersSent) {
      res.status(500).send('Error establishing SSE stream');
    }
  }
});

// Messages endpoint for receiving client JSON-RPC requests
app.post('/messages', async (req: Request, res: Response) => {
  console.log('Received POST request to /messages');

  // Extract session ID from URL query parameter
  // In the SSE protocol, this is added by the client based on the endpoint event
  const sessionId = req.query.sessionId as string | undefined;

  if (!sessionId) {
    console.error('No session ID provided in request URL');
    res.status(400).send('Missing sessionId parameter');
    return;
  }

  const transport = transports[sessionId];
  if (!transport) {
    console.error(`No active transport found for session ID: ${sessionId}`);
    res.status(404).send('Session not found');
    return;
  }

  try {
    // Handle the POST message with the transport
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).send('Error handling request');
    }
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Simple SSE Server (deprecated protocol version 2024-11-05) listening on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');

  // Close all active transports to properly clean up resources
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  console.log('Server shutdown complete');
  process.exit(0);
});
