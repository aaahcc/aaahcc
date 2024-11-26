// Store search results globally for name filtering
let currentSearchResults = [];
let GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL'; // Replace with your deployed Google Apps Script URL

// Function to search for forms
async function searchForms() {
    const emailInput = document.getElementById('emailSearch');
    const email = emailInput.value.trim();
    const loadingMessage = document.getElementById('loadingMessage');
    const searchResults = document.getElementById('searchResults');
    const nameSearchSection = document.getElementById('nameSearchSection');

    // Reset UI
    nameSearchSection.style.display = 'none';
    document.getElementById('nameSearch').value = '';

    // Validate email
    if (!email || !isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }

    // Show loading message
    loadingMessage.style.display = 'block';
    searchResults.innerHTML = '';

    try {
        // For testing - remove in production
        console.log('Searching for forms with email:', email);
        
        // Create form data for the search request
        const formData = new FormData();
        formData.append('email', email);
        formData.append('action', 'searchForms');

        // Log the URL being used
        console.log('Sending request to:', GOOGLE_SCRIPT_URL);

        // First, try a test request to check if the URL is accessible
        try {
            const testResponse = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'HEAD',
                mode: 'no-cors'
            });
            console.log('URL is accessible');
        } catch (error) {
            console.error('Error accessing script URL:', error);
            throw new Error('Unable to connect to the form search service. Please check your internet connection.');
        }

        // Send the actual search request
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });

        console.log('Search request sent successfully');
        
        // Since we're using no-cors, we'll handle the response through a callback
        checkSearchResults(email);

    } catch (error) {
        console.error('Error details:', error);
        
        let errorMessage = 'An error occurred while searching for your forms.';
        if (error.message) {
            errorMessage += ' ' + error.message;
        }
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL') {
            errorMessage = 'The form search service is not properly configured. Please contact support.';
        }
        
        showError(errorMessage);
    } finally {
        loadingMessage.style.display = 'none';
    }
}

// Function to check search results with better error handling
function checkSearchResults(email) {
    const maxAttempts = 10;
    let attempts = 0;
    const loadingMessage = document.getElementById('loadingMessage');

    console.log('Starting to check for results');

    const checkInterval = setInterval(() => {
        attempts++;
        console.log(`Checking results attempt ${attempts} of ${maxAttempts}`);
        
        try {
            // Create a hidden form to request results
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = GOOGLE_SCRIPT_URL;
            
            const emailInput = document.createElement('input');
            emailInput.type = 'hidden';
            emailInput.name = 'email';
            emailInput.value = email;
            
            const actionInput = document.createElement('input');
            actionInput.type = 'hidden';
            actionInput.name = 'action';
            actionInput.value = 'checkResults';
            
            form.appendChild(emailInput);
            form.appendChild(actionInput);
            
            // Create hidden iframe for response
            const frameId = 'hidden_frame_' + Date.now();
            const iframe = document.createElement('iframe');
            iframe.name = frameId;
            iframe.style.display = 'none';
            iframe.onerror = (error) => {
                console.error('iframe error:', error);
                clearInterval(checkInterval);
                showError('Error connecting to the search service. Please try again.');
                loadingMessage.style.display = 'none';
            };
            
            document.body.appendChild(iframe);
            form.target = frameId;
            
            // Submit form
            document.body.appendChild(form);
            form.submit();
            
            // Clean up
            document.body.removeChild(form);
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                document.body.removeChild(iframe);
                showError('Search request timed out. Please try again.');
                loadingMessage.style.display = 'none';
                console.log('Search timed out after maximum attempts');
            }
        } catch (error) {
            console.error('Error during result check:', error);
            clearInterval(checkInterval);
            showError('An error occurred while checking search results. Please try again.');
            loadingMessage.style.display = 'none';
        }
    }, 2000);
}

// Function to handle search results (called by Google Apps Script)
function handleSearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    const loadingMessage = document.getElementById('loadingMessage');
    const nameSearchSection = document.getElementById('nameSearchSection');
    
    loadingMessage.style.display = 'none';

    if (!results || results.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No forms found for this email address.</p>';
        return;
    }

    // Store results globally
    currentSearchResults = results;

    // Check if we have multiple forms with different first names
    const uniqueNames = new Set(results.map(form => form.firstName));

    if (uniqueNames.size > 1) {
        // Show name search if multiple patients found
        nameSearchSection.style.display = 'block';
        displayResults(results); // Display all results initially
    } else {
        // Show results directly if only one patient
        nameSearchSection.style.display = 'none';
        displayResults(results);
    }
}

// Function to filter results by first name
function filterByName() {
    const nameInput = document.getElementById('nameSearch');
    const firstName = nameInput.value.trim().toLowerCase();

    if (!firstName) {
        showError('Please enter a first name.');
        return;
    }

    const filteredResults = currentSearchResults.filter(form => 
        form.firstName.toLowerCase().includes(firstName)
    );

    displayResults(filteredResults);
}

// Function to display results
function displayResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (!results || results.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No forms found matching these criteria.</p>';
        return;
    }

    // Group forms by first name
    const groupedForms = {};
    results.forEach(form => {
        if (!groupedForms[form.firstName]) {
            groupedForms[form.firstName] = [];
        }
        groupedForms[form.firstName].push(form);
    });

    // Display results grouped by first name
    let html = '<div class="forms-list">';
    
    for (const [firstName, forms] of Object.entries(groupedForms)) {
        html += `
            <div class="patient-group">
                <h2 class="patient-name">Patient: ${firstName}</h2>
                <div class="patient-forms">
        `;
        
        forms.forEach(form => {
            html += `
                <div class="form-item">
                    <h3>${form.type}</h3>
                    <p>Submitted: ${new Date(form.timestamp).toLocaleDateString()}</p>
                    ${form.status === 'Pending Signature' ? 
                        `<a href="${form.signatureLink}" class="action-button">Sign Form</a>` :
                        `<span class="status-complete">✓ Completed</span>`
                    }
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    searchResults.innerHTML = html;
}

// Function to show error messages
function showError(message) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `<p class="error-message">${message}</p>`;
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
