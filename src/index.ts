import './components/explore-page';
import './components/subreddit-view';
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

  document.querySelectorAll('input.checkbox').forEach((elem) => {
    const input = elem as HTMLInputElement;
    input.addEventListener('change', () => {
      const flag = input.id || 'showSubreddit';
      console.log(flag);
      explore.setAttribute(flag, input.checked + '');
    });
  });
}

main();
