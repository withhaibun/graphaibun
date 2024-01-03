import * as http from 'http';
import express from 'express';
import WebSocket, { WebSocketServer } from "ws";
import path from 'path';
import { fileURLToPath } from 'url';
import { synthGraph } from './synthGraph.js';
import { readDirectory } from './files.js';
import { GraphMe } from './GraphMe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const updateGraph = true ? readDirectory : synthGraph;

export const graphMe = new GraphMe();
let lastLength = 0;

doUpdate();

function doUpdate() {
  const interval = updateGraph();
  broadcastGraphUpdate();

  setTimeout(() => {
    graphMe.generations++;
    doUpdate();
  }, interval);
}

const send = (ws: WebSocket, graph: any) => ws.send(JSON.stringify({ graph, meta: { first: graphMe.first, latest: graphMe.latest } }));
// Function to broadcast graph updates to connected clients
function broadcastGraphUpdate() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      send(client, graphMe.graph);
      if (graphMe.graph.nodes.length !== lastLength) {
        console.log('graphMe.nodes.length', graphMe.graph.nodes.length, graphMe.graph.nodes.find((n) => n.label === '/home/vid/D/dev/withhaibun/graphaibun'));
        lastLength = graphMe.graph.nodes.length;
      }
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Send the current graph data to the newly connected client
  send(ws, graphMe.graph);

  // Handle incoming messages (if needed)
  ws.on('message', (message) => {
    // Handle client messages here, e.g., graph updates
    // Update the graph data as needed and then broadcast the updated graph
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