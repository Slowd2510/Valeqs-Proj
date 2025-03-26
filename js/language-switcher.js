document.addEventListener('DOMContentLoaded', function() {
    // Check user's location by IP address using a free API
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            // Get country code from response
            const countryCode = data.country_code;
            
            // Set language based on location
            const language = countryCode === 'DE' ? 'de' : 'en';
            
            // Store the language preference in localStorage
            localStorage.setItem('preferredLanguage', language);
            
            // Apply the language
            applyLanguage(language);
        })
        .catch(error => {
            console.error('Error detecting location:', error);
            // Default to English if location detection fails
            applyLanguage('en');
        });
});

// Function to apply the selected language
function applyLanguage(language) {
    // Load the appropriate translation file
    fetch(`/translations/${language}.json`)
        .then(response => response.json())
        .then(translations => {
            // Find all elements with a data-translate attribute
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[key]) {
                    element.textContent = translations[key];
                }
            });
        })
        .catch(error => console.error('Error loading translations:', error));
}