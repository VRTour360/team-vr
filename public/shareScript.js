/* eslint-disable */
(function () {
  const s = document.currentScript;

  if (s) {
    const idWithParams = s.getAttribute('data-short');
    const path = s.getAttribute('data-path');
    const isSelfHosted = s.getAttribute('data-is-self-hosted');
    const width = s.getAttribute('width');
    const height = s.getAttribute('height');
    const src = s.getAttribute('src');
    const urlObj = new URL(src);

    let id, params;
    if (idWithParams) {
      const splittedData = idWithParams.split('?');
      id = splittedData[0];
      params = splittedData[1]
        ? `?${splittedData[1]}`
        : '';
    }

    if (id) {
      // regexp for check valid size values (width/height)
      const regexp = /[0-9]*\.?[0-9]+(px|%)/i;

      let targetPath = 'tours';
      if (path) {
        targetPath = path;
      }

      const createIframe = (title) => {
        const attrs = {
          allowfullscreen: '',
          frameborder: 0,
          allow: 'camera;microphone;vr;accelerometer;gyroscope;fullscreen',
          width: width && regexp.test(width) ? width : '100%',
          height: height && regexp.test(height) ? height : '500px',
          'aria-label': id,
          'aria-labelledby': id,
          role: 'presentation',
          title: title || 'View 360 Tour',
        };

        const iframe = document.createElement('iframe');
        iframe.src = isSelfHosted ? `${urlObj.origin}${params}` : `${urlObj.origin}/${targetPath}/${id}${params}`;

        for (const key in attrs) {
          iframe.setAttribute(key, attrs[key]);
        }
        s.parentNode.insertBefore(iframe, s);
        document.getElementById(`cp-splash-screen-${id}`)?.remove();
      };

      const createSplashScreen = (data) => {
        const splashScreenContainer = document.createElement('div');
        splashScreenContainer.id = `cp-splash-screen-${id}`;
        splashScreenContainer.onclick = () => createIframe(data.title);

        splashScreenContainer.style = `
          background-color: #000;
          background-image: url(${data.thumbUrl});
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center center;
          width: ${width && regexp.test(width) ? width : '100%'};
          height: ${height && regexp.test(height) ? height : '500px'};
          position: relative;
          cursor: pointer;
        `;

        const splashScreenContainerOverlay = document.createElement('div');
        splashScreenContainerOverlay.style = `
          background-color: rgba(0, 0, 0, 0.5);
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          position: absolute;
          z-index: 1;
      `;

        const splashScreenTitle = document.createElement('h3');
        splashScreenTitle.innerText = data.title;
        splashScreenTitle.style = `
          color: #fff;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Lato';
          position: absolute;
          top: 15%;
          left: 20%;
          right: 20%;
          font-size: 30px;
          margin: 0;
          z-index: 2;
        `;

        const splashScreenPlay = document.createElement('div');
        splashScreenPlay.style = `
          background-color: #000;
          border-radius: 4px;
          width: 65px;
          height: 65px;
          position: absolute;
          left: 50%;
          z-index: 1;
          transform: translate(-50%, -50%);
          top: 50%;
          z-index: 2;
        `;

        const splashScreenPlayIcon = document.createElement('div');
        splashScreenPlayIcon.style = `
          width: 0px;
          height: 0px;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 30px solid rgb(255, 255, 255);
          position: absolute;
          left: 50%;
          z-index: 2;
          transform: translate(-50%, -50%) rotate(90deg);
          top: 50%;
          margin-left: 3px;
        `;

        const splashScreenFooter = document.createElement('img');
        splashScreenFooter.style = `
          position: absolute;
          bottom: 5%;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          z-index: 2;
        `;
        splashScreenFooter.src = `${urlObj.origin}/public/powered-by-cp.png`;

        splashScreenContainer.appendChild(splashScreenTitle);
        splashScreenContainer.appendChild(splashScreenContainerOverlay);
        splashScreenPlay.appendChild(splashScreenPlayIcon);
        splashScreenContainer.appendChild(splashScreenPlay);
        splashScreenContainer.appendChild(splashScreenFooter);

        s.parentNode.insertBefore(splashScreenContainer, s);
      };

      if (targetPath === 'tours' && !isSelfHosted) {
        fetch(`${urlObj.origin}/api/tours/${id}/embeddedConfig`)
          .then(res => {
            if (res.status === 200) {
              return res.json();
            } else {
              throw res;
            }
          })
          .then(res => {
            if (!res.data.showSplashScreen) {
              createIframe(res.data.title);
            } else {
              createSplashScreen(res.data);
            }
          })
          .catch(() => {
            createIframe();
          })
      } else {
        createIframe();
      }
    }
  }
}());
