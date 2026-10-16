
      document.querySelector('meta[name="theme-color"]')
        .setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--theme-background-color') || '#312E2B');
    