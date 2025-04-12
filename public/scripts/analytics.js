(function() {
    if (typeof window === 'undefined') return;
    
    const ANALYTICS_API = '/api/analytics/track';
    
    function getSessionId() {
      let sessionId = localStorage.getItem('site_session_id');
      if (!sessionId) {
        sessionId = generateRandomId();
        localStorage.setItem('site_session_id', sessionId);
      }
      return sessionId;
    }
    
    function generateRandomId() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    function trackPageView() {
      const path = window.location.pathname;
      const referrer = document.referrer;
      const sessionId = getSessionId();
      
      fetch(ANALYTICS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path,
          referrer,
          sessionId,
          timestamp: new Date().toISOString()
        }),
        keepalive: true
      }).catch(console.error);
      
      let timeOnPage = 0;
      const startTime = Date.now();
      
      const trackTimeOnPage = () => {
        timeOnPage = Math.floor((Date.now() - startTime) / 1000);
        
        fetch(ANALYTICS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path,
            sessionId,
            timeOnPage,
            event: 'timeupdate'
          }),
          keepalive: true
        }).catch(console.error);
      };
      
      window.addEventListener('beforeunload', trackTimeOnPage);
      
      setInterval(() => {
        timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      }, 1000);
      
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          trackTimeOnPage();
        }
      });
    }
    
    trackPageView();
  })();