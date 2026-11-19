// server.js
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const postManager = require('./postManager');

const PORT = process.env.PORT || 3000;

// Fonction pour parser le body JSON
function parseJsonBody(request, callback) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        if (!body.trim()) {
            return callback(null, {});
        }
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    });
}

// Créer le serveur en testant la méthode HTTP et le pathname
const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const method = request.method;

    // Gestion du preflight CORS
    if (method === 'OPTIONS') {
        response.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        response.end();
        return;
    }

    // Headers CORS pour permettre l'accès depuis le client web
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Content-Type', 'application/json');

    const send = (status, data) => {
        response.writeHead(status);
        response.end(JSON.stringify(data));
    };

    const idMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);

    // GET /api/posts - Obtenir tous les posts
    if (pathname === '/api/posts' && method === 'GET') {
        postManager.getAllPosts((err, posts) => {
            if (err) {
                send(500, { error: 'Erreur serveur' });
            } else {
                send(200, posts);
            }
        });
        return;
    }

    // GET /api/posts/:id - Obtenir un post par ID
    if (idMatch && method === 'GET') {
        const id = decodeURIComponent(idMatch[1]);
        postManager.getPost(id, (err, post) => {
            if (err) {
                send(404, { error: 'Post non trouvé' });
            } else {
                send(200, post);
            }
        });
        return;
    }

    // POST /api/posts - Créer un nouveau post
    if (pathname === '/api/posts' && method === 'POST') {
        parseJsonBody(request, (err, data) => {
            if (err) {
                send(400, { error: 'JSON invalide' });
                return;
            }
            postManager.insertPost(data, (insertErr, post) => {
                if (insertErr) {
                    send(500, { error: 'Erreur serveur' });
                } else {
                    send(201, post);
                }
            });
        });
        return;
    }

    // PUT /api/posts/:id - Mettre à jour un post
    if (idMatch && method === 'PUT') {
        const id = decodeURIComponent(idMatch[1]);
        parseJsonBody(request, (err, data) => {
            if (err) {
                send(400, { error: 'JSON invalide' });
                return;
            }
            postManager.updatePost(id, data, (updateErr, post) => {
                if (updateErr) {
                    send(404, { error: 'Post non trouvé' });
                } else {
                    send(200, post);
                }
            });
        });
        return;
    }

    // DELETE /api/posts/:id - Supprimer un post
    if (idMatch && method === 'DELETE') {
        const id = decodeURIComponent(idMatch[1]);
        postManager.deletePost(id, (err, post) => {
            if (err) {
                send(404, { error: 'Post non trouvé' });
            } else {
                send(200, { message: 'Post supprimé', post });
            }
        });
        return;
    }

    // Servir le client web (vue simple)
    if (pathname === '/' || pathname === '/index.html') {
        const filePath = path.join(__dirname, 'client', 'index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                send(404, { error: 'Vue non trouvée' });
                return;
            }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.writeHead(200);
            response.end(content);
        });
        return;
    }

    // Route non trouvée
    send(404, { error: 'Route non trouvée' });
});

// Démarrer le serveur
server.listen(PORT, () => {
    console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
    console.log('Routes disponibles:');
    console.log('  GET    /api/posts');
    console.log('  GET    /api/posts/:id');
    console.log('  POST   /api/posts');
    console.log('  PUT    /api/posts/:id');
    console.log('  DELETE /api/posts/:id');
    console.log(`  VIEW   http://localhost:${PORT}/`);
});