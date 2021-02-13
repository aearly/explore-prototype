import './components/explore-page';
import {ExplorePage} from './components/explore-page';

async function main() {
  const explore = document.querySelector('explore-page') as ExplorePage;
  document.querySelectorAll('button.pill').forEach((button) => {
    button.addEventListener('click', () => {
      const topic = button.innerHTML.toLowerCase();
      console.log({topic});
      explore.setAttribute('topic', topic);
    });
  });
}

main();
