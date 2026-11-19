// postManager.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Lire le fichier des posts
function readPosts(callback) {
    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
        if (err) {
            return callback(err);
        }
        let posts = [];
        try {
            const trimmed = (data || '').trim();
            if (trimmed) {
                posts = JSON.parse(trimmed);
                if (!Array.isArray(posts)) {
                    posts = [];
                }
            }
        } catch (parseError) {
            return callback(parseError);
        }
        callback(null, posts);
    });
}

// Lire tous les posts
function getAllPosts(callback) {
    readPosts(callback);
}

// Obtenir un post par ID
function getPost(id, callback) {
    readPosts((err, posts) => {
        if (err) {
            return callback(err);
        }
        const post = posts.find(p => String(p.id) === String(id));
        if (!post) {
            return callback(new Error('Post non trouvé'));
        }
        callback(null, post);
    });
}

// Fonction utilitaire pour sauvegarder les posts
function savePosts(posts, callback) {
    fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8', (err) => {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
}

// Insérer un nouveau post
function insertPost(newPost, callback) {
    readPosts((err, posts) => {
        if (err) {
            return callback(err);
        }
        const ids = posts.map(p => Number(p.id)).filter(n => !Number.isNaN(n));
        const newId = ids.length ? Math.max(...ids) + 1 : 1;
        const post = { id: newId, ...newPost };
        posts.push(post);
        savePosts(posts, (saveErr) => {
            if (saveErr) {
                return callback(saveErr);
            }
            callback(null, post);
        });
    });
}

// Mettre à jour un post
function updatePost(id, updatedPost, callback) {
    readPosts((err, posts) => {
        if (err) {
            return callback(err);
        }
        const index = posts.findIndex(p => String(p.id) === String(id));
        if (index === -1) {
            return callback(new Error('Post non trouvé'));
        }
        posts[index] = { ...posts[index], ...updatedPost, id: posts[index].id };
        savePosts(posts, (saveErr) => {
            if (saveErr) {
                return callback(saveErr);
            }
            callback(null, posts[index]);
        });
    });
}

// Supprimer un post
function deletePost(id, callback) {
    readPosts((err, posts) => {
        if (err) {
            return callback(err);
        }
        const index = posts.findIndex(p => String(p.id) === String(id));
        if (index === -1) {
            return callback(new Error('Post non trouvé'));
        }
        const removed = posts.splice(index, 1)[0];
        savePosts(posts, (saveErr) => {
            if (saveErr) {
                return callback(saveErr);
            }
            callback(null, removed);
        });
    });
}

// Exporter les fonctions
export {
    getAllPosts,
    getPost,
    insertPost,
    updatePost,
    deletePost,
    savePosts
};