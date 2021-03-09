import './components/explore-page';
import './components/subreddit-view';
import {ExplorePage} from './components/explore-page';

const TOPIC_RE = /t\/(\w+)/;
const MULTI_RE = /r\/((?:\w+\+)+\w+)/;
const SUBREDIT_RE = /r\/(\w+)(?:\/(\w+))?/;

const TOPICS: Record<string, string> = {
  gaming:
    'gaming+halo+PS4+rpg+iosgaming+gamingsuggestions+computers+' +
    'ShouldIbuythisgame+MechanicalKeyboards+Monitors+hardwareswap+OpTicGaming+' +
    'DotA2+pcmasterrace+GirlGamers+gamecollecting+IndieGaming+Fallout+Games+' +
    'nintendo+SuggestALaptop+Steam+Competitiveoverwatch+wow+funny',
  music:
    'Music+Vaporwave+Guitar+MusicEd+WeAreTheMusicMakers+indieheads+Metal+' +
    'LetsTalkMusic+DeepIntoYouTube+musictheory+Metalcore+CasualConversation+' +
    'ListeningHeads+AskReddit+woahdude+composer+poppunkers+anime+' +
    'ThisIsOurMusic+unpopularopinion+AdviceAnimals+BABYMETAL+gaming+EDM+technology"',
  sports:
    'sports+soccer+todayilearned+starcraft+baseball+esports+reddevils+AskReddit+' +
    'nfl+CFB+nba+hockey+leagueoflegends+ABraThatFits+funny+formula1+MMA+' +
    'Patriots+gaming+cordcutters+dogecoin+granturismo+Showerthoughts+unpopularopinion+MLS',
  beauty:
    'beauty+AsianBeauty+OldSchoolCool+funny+MUAontheCheap+makeupexchange+' +
    'KoreanBeauty+pics+Porsche+RandomActsofMakeup+MakeupAddiction+disney+' +
    'BeautyAddiction+BeautyBoxes+AskWomen+succulents+BeautyGuruChatter+' +
    'beautytalkph+houseplants+aww+ShinyPokemon+cats+gardening+FreeKarma4U+gaming',
};

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
      switch (input.id) {
        case 'showtitle': {
          explore.setAttribute('showtitle', input.checked + '');
          explore.setAttribute('showsubreddit', input.checked + '');
          return;
        }
      }
    });
  });

  const exploreHeader = document.querySelector(
    '.explore-header'
  ) as HTMLHeadingElement;
  const subredditHeader = document.querySelector(
    '.subreddit-header'
  ) as HTMLHeadingElement;

  function showExploreHeader() {
    exploreHeader.classList.remove('hidden');
    subredditHeader.classList.add('hidden');
  }
  function showSubredditHeader() {
    exploreHeader.classList.add('hidden');
    subredditHeader.classList.remove('hidden');
  }

  const backButton = document.querySelector('.back');
  backButton?.addEventListener('click', () => {
    window.history.go(-1);
  });

  window.addEventListener('hashchange', go);
  go();

  function go(): void {
    const route = window.location.hash?.replace(/(^!|\/$)/, '') || '';
    if (!route) goTopic('gaming');

    let match;
    match = route.match(TOPIC_RE);
    if (match) {
      const [, topic] = match;
      return goMulti(TOPICS[topic] ?? TOPICS.gaming);
    }
    match = route.match(MULTI_RE);
    if (match) {
      const [, multi] = match;
      return goMulti(multi);
    }
    match = route.match(SUBREDIT_RE);
    if (match) {
      const [, subreddit, postId] = match;
      return goSubreddit(subreddit, postId);
    }

    function goTopic(topic: string) {
      const multi = TOPICS[topic] ?? TOPICS.gaming;
      explore.setAttribute('subreddit', '');
      explore.setAttribute('multi', multi);
      explore.setAttribute('post', '');
      showExploreHeader();
    }
    function goMulti(multi: string) {
      explore.setAttribute('subreddit', '');
      explore.setAttribute('post', '');
      explore.setAttribute('multi', multi);
      showExploreHeader();
    }
    function goSubreddit(subreddit: string, postId?: string) {
      explore.setAttribute('multi', '');
      explore.setAttribute('postId', postId || '');
      explore.setAttribute('subreddit', subreddit);
      showSubredditHeader();
    }
  }
}

main();
