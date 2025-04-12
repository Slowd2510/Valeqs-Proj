document.addEventListener('DOMContentLoaded', function() {
    // Check user's location by IP address using a free API
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
           
            const countryCode = data.country_code;
            
            
            const language = countryCode === 'DE' ? 'de' : 'en';
            
           
            localStorage.setItem('preferredLanguage', language);
            
          
            applyLanguage(language);
        })
        .catch(error => {
            console.error('Error detecting location:', error);
           
            applyLanguage('en');
        });
});


function applyLanguage(language) {
   
    fetch(`/translations/${language}.json`)
        .then(response => response.json())
        .then(translations => {
           
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[key]) {
                    element.textContent = translations[key];
                }
            });
        })
        .catch(error => console.error('Error loading translations:', error));
}