import fs from 'node:fs/promises';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

async function fetchPosts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // console.log(data)
    return data;
  } catch (error) {
    console.error('Fetch failed:', error.message);
    if (error.cause) console.error('Cause exacte :', error.cause);
    return null; 
  }
}

async function savePosts(posts) {
  try {
    const data_posts = JSON.stringify(posts, null, 2);
    // il faut passée les donnée sous forme des test dans l'arguement de notre fonction de writefile 
    await fs.writeFile('./posts.json', data_posts, 'utf-8');
    console.log('Données sauvegardées avec succès dans ./posts.json');
  } catch (erreur) {
    console.error('Une erreur est survenue lors de la sauvegarde :', erreur.message);
  }
}

async function main() {
  const dataPosts = await fetchPosts();
  
  if (dataPosts) {
    await savePosts(dataPosts);
  } else {
    console.log('Annulation de la sauvegarde suite à l\'échec de récupération.');
  }
} 

main();
