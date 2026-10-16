
    const isFromGdprCountry = false;

    window.context ??= {};
    window.context.onetrust = {};
    window.context.onetrust.isRequestFromGdpr = isFromGdprCountry;

    function OptanonWrapper() {
      window.dispatchEvent(new CustomEvent('oneTrustLoaded'));

      const urlHash = window.location.hash.slice(1);
      const showLimitedAds = false;

      
      if (urlHash === 'privacy_settings') {
        window.OneTrust?.ToggleInfoDisplay();
      }

              
        window.googletag = window.googletag || { cmd: [] };

        window.googletag.cmd.push(() => {
          if (!window.OptanonActiveGroups.match(/,C0004,/)) {
            window.googletag.pubads().setPrivacySettings({
              nonPersonalizedAds: true,
              ...(showLimitedAds && { limitedAds: true })
            });
          }
        });
          }
  