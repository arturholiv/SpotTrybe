const CLIENT_ID = 'f96d2a04a0f545c0aefcf3cf1fba85f3'
const CLIENT_SECRET = 'ab7f2825ac4b4e0cbaf12140dc5ab457'
const ID_AND_SECRET = `${CLIENT_ID}:${CLIENT_SECRET}`
const BASE_URL = 'https://api.spotify.com/v1';
let token;

const getToken = async () => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(ID_AND_SECRET)}`
    }
  });

  const data = await response.json();

  token = data.access_token;

  return token;
}

const getHeader = () => {
  const header = new Headers({
    'Authorization': `Bearer ${token}`,
  })
  return header;
}

const createPlayer = () => {
  const playerContainer = document.querySelector('.return-container');

  const audio = document.createElement('audio');
  audio.id = 'player';
  audio.controls = true;
  audio.autoplay = true;

  const source = document.createElement('source');

  audio.appendChild(source);
  playerContainer.appendChild(audio);

  return audio;
}

const getTrack = async (id) => {
  const headers = getHeader();
  const response = await fetch(`${BASE_URL}/playlists/${id}/tracks`, {
    headers,
  });
  const data = await response.json();

  const { items } = data;
  renderDOM('track', 'track__card', items);
}

const getPlaylist = async (id) => {
  const headers = getHeader();
  const response = await fetch(`${BASE_URL}/browse/categories/${id}/playlists`, {
    headers,
  });
  const data = await response.json();

  const { playlists } = data;
  const { items } = playlists;
  renderDOM('playlist', 'playlist__card', items);
}

const getElementOrClosest = target => {
  const genre = 'genre__card';
  const playlist = 'playlist__card';
  const track = 'track__card';

  if(target.classList.contains(track || playlist || genre)) return target;

  return target.closest(`.${track}`)  || target.closest(`.${playlist}`) || target.closest(`.${genre}`);
}

const getHandleItem = ({ target }) => {
  const card = getElementOrClosest(target);

  const nameClass = card.className.split(' ');
  const previousSelect = document.querySelector(`.${nameClass[0]}.item-selected`);
  
  if(previousSelect){
    previousSelect.classList.remove('item-selected');
  }

  card.classList.add('item-selected');

  if (nameClass.includes('genre__card')) getPlaylist(card.id);
  if (nameClass.includes('playlist__card')) getTrack(card.id);
  if (nameClass.includes('track__card')) {
    const player = document.querySelector('#player') ? document.querySelector('#player') : createPlayer();

    const source = player.querySelector('source');
    source.src = card.name;
  
    player.load();
  };
}

const renderIMG = (item) => {
  const img = document.createElement('img');
  img.className = 'image-card';

  if (item.images) {
    img.src = item.images[0].url;
    return img;
  };
  if (item.icons) {
    img.src = item.icons[0].url;
    return img;
  };
}

const renderDOM = (nameClassDad, nameClass, items) => {
  const section = document.querySelector(`.${nameClassDad}`)
  
  items.forEach((item) => {
    const div = document.createElement('div');
    
    const p = document.createElement('p');
  
    div.className = nameClass;
    div.id = item.id || item.track.id;
    div.name = item.name || item.track.preview_url;
    
    p.innerText = item.name || item.track.name;
    
    if(nameClass !== 'track__card') {
    const img = renderIMG(item);
    div.appendChild(img);
    };

    div.appendChild(p);
    section.appendChild(div);

    section.addEventListener('click', getHandleItem);
  })
}

const getAllGenres = async () => {
  const headers = getHeader();
  const response = await fetch(`${BASE_URL}/browse/categories?locale=pt-BR`,{
    headers,
  })
  const data = await response.json();
  const { categories } = data;
  const { items } = categories;
  renderDOM('genre', 'genre__card', items, items);
}

window.onload = async () => {
  await getToken();

  getAllGenres();
}
