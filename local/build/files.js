import * as fs from 'fs';
import * as path from 'path';
import { graphMe } from './server.js';
const dirPath = '/home/vid/D/dev/withhaibun/graphaibun';
function getFileType(filePath) {
    if (fs.statSync(filePath).isDirectory())
        return 'directory';
    if (fs.statSync(filePath).isFile())
        return 'file';
    if (fs.statSync(filePath).isSymbolicLink())
        return 'symlink';
    return 'unknown';
}
export function readDirectory() {
    const id = graphMe.createNode({ type: 'directory', group: ext(dirPath), label: dirPath, created: fs.statSync(dirPath).ctimeMs, fz: 0 });
    goToThere(dirPath, id, 1);
    return 100000000;
}
const ext = (file) => file.replace(/.*\./, '');
export function goToThere(dirPath, parentId, depth) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const fileType = getFileType(filePath);
        const created = fs.statSync(filePath).ctimeMs;
        const currentNodeId = graphMe.graph.nodes.length;
        if (parentId !== null) {
            graphMe.createNode({ type: fileType, group: ext(file), label: file, created, fz: depth });
            graphMe.createLink(parentId, currentNodeId, 'contains');
        }
        if (fileType === 'directory' && file !== 'node_modules') {
            try {
                goToThere(filePath, currentNodeId, depth++);
            }
            catch (e) {
                console.error(filePath, 'failed:', e.message);
            }
        }
    });
}
//# sourceMappingURL=files.js.map