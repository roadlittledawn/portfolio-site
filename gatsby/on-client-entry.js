import isLocalStorageAvailable from '../src/utils/isLocalStorageAvailable';

const onClientEntry = () => {
   isDarkMode();
}

const isDarkMode = () => {
  // if (isLocalStorageAvailable()) {
  //   const localStorageTheme = localStorage.getItem('darkMode');
  //   if (localStorageTheme === 'true' || localStorageTheme === 'false') {
  //     return JSON.parse(localStorageTheme);
  //   }
  // }
  window.localStorage.setItem(
    'darkMode',
    document.body.classList.contains('dark-mode')
  );
};

export default onClientEntry;
