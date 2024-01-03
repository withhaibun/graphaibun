import * as http from 'http';
import express from 'express';
import WebSocket, { WebSocketServer } from "ws";
import path from 'path';
import { fileURLToPath } from 'url';
import { synthGraph } from './synthGraph.js';
import { readDirectory } from './files.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const updateGraph = readDirectory

export type TGraph = {
  nodes: { id: number; label: string; type: string, group: string, created: number, fx?: number, fy?: number, fz?: number }[];
  links: { id: number, source: number; target: number, linkType: string, created: number }[];
};

let latest = 0;
const first = new Date().getTime();
export let generations = 0;

export function created() {
  latest = new Date().getTime();
  return latest;
}

// Initialize an empty graph (you can use your actual graph data here)
export let graph: TGraph = {
  nodes: [],
  links: [],
};

export const groups = ['Group 1', 'Group 2', 'Group 3'];
export const linkTypes = ['Type 1', 'Type 2', 'Type 3'];
updateGraph();
setInterval(() => { generations++; updateGraph(), broadcastGraphUpdate(); }, 4000 + Math.random() * 9000);

const send = (ws: WebSocket, graph: any) => ws.send(JSON.stringify({ graph, meta: { first, latest } }));
// Function to broadcast graph updates to connected clients
function broadcastGraphUpdate() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      send(client, graph);
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Send the current graph data to the newly connected client
  send(ws, graph);

  // Handle incoming messages (if needed)
  ws.on('message', (message) => {
    // Handle client messages here, e.g., graph updates
    // Update the graph data as needed and then broadcast the updated graph
    graph = JSON.parse(message.toString());
    broadcastGraphUpdate();
  });
});

server.listen(9000, () => {
  console.log('Server is running on http://localhost:9000');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '../', 'browser/public/index.html'));
});
app.get('/main.js', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '../', 'browser/public/main.js'));
});