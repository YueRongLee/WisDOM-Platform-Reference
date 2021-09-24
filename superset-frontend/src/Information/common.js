export const ModifyLink = content => {
  const el = document.createElement('html');
  el.innerHTML = content;
  const links = el.getElementsByTagName('a');
  const len = links.length;

  const video = el.querySelectorAll('iframe');
  const videoLen = video.length;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < len; i++) {
    if (links[i].href.includes(window.location.hostname)) {
      links[i].target = '';
    }
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < videoLen; i++) {
    video[i].style.width = 'auto';
  }

  return el.outerHTML;
};
