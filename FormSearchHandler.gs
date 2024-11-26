// Replace with your form IDs
const REGISTRATION_FORM_ID = 'YOUR_REGISTRATION_FORM_ID';
const CONSENT_FORM_ID = 'YOUR_CONSENT_FORM_ID';

function doPost(e) {
  const params = e.parameter;
  const action = params.action;
  const email = params.email;
  
  if (!email) {
    return sendJsonResponse({ error: 'Email is required' });
  }
  
  if (action === 'searchForms') {
    return handleSearchForms(email);
  } else if (action === 'checkResults') {
    return handleCheckResults(email);
  }
  
  return sendJsonResponse({ error: 'Invalid action' });
}

function handleSearchForms(email) {
  try {
    const forms = [];
    
    // Search registration form responses
    const regForm = FormApp.openById(REGISTRATION_FORM_ID);
    const regResponses = regForm.getResponses();
    
    for (let response of regResponses) {
      const itemResponses = response.getItemResponses();
      let responseEmail = '';
      let firstName = '';
      
      // Extract email and first name from response
      for (let item of itemResponses) {
        const title = item.getItem().getTitle().toLowerCase();
        if (title.includes('email')) {
          responseEmail = item.getResponse().toLowerCase();
        } else if (title.includes('first name')) {
          firstName = item.getResponse();
        }
      }
      
      if (responseEmail === email.toLowerCase()) {
        forms.push({
          type: 'Registration Form',
          timestamp: response.getTimestamp(),
          status: 'Completed',
          id: response.getId(),
          firstName: firstName
        });
      }
    }
    
    // Search consent form responses
    const consentForm = FormApp.openById(CONSENT_FORM_ID);
    const consentResponses = consentForm.getResponses();
    
    for (let response of consentResponses) {
      const itemResponses = response.getItemResponses();
      let responseEmail = '';
      let firstName = '';
      
      // Extract email and first name from response
      for (let item of itemResponses) {
        const title = item.getItem().getTitle().toLowerCase();
        if (title.includes('email')) {
          responseEmail = item.getResponse().toLowerCase();
        } else if (title.includes('first name')) {
          firstName = item.getResponse();
        }
      }
      
      if (responseEmail === email.toLowerCase()) {
        forms.push({
          type: 'Consent Form',
          timestamp: response.getTimestamp(),
          status: 'Completed',
          id: response.getId(),
          firstName: firstName
        });
      }
    }
    
    // Check for pending consent forms
    const scriptProperties = PropertiesService.getScriptProperties();
    const pendingConsents = JSON.parse(scriptProperties.getProperty('pendingConsents') || '{}');
    
    if (pendingConsents[email]) {
      forms.push({
        type: 'Consent Form',
        timestamp: new Date(),
        status: 'Pending Signature',
        signatureLink: pendingConsents[email].url,
        firstName: pendingConsents[email].firstName || 'Unknown'
      });
    }
    
    // Store results for later retrieval
    cacheResults(email, forms);
    
    return sendJsonResponse({ success: true });
    
  } catch (error) {
    Logger.log('Error searching forms: ' + error.toString());
    return sendJsonResponse({ error: 'Error searching forms' });
  }
}

function handleCheckResults(email) {
  const results = getCachedResults(email);
  if (!results) {
    return sendJsonResponse({ error: 'No results found' });
  }
  
  // Clear cache after retrieving results
  clearCache(email);
  
  return sendJsonResponse({ results: results });
}

function cacheResults(email, results) {
  const cache = CacheService.getScriptCache();
  cache.put(email, JSON.stringify(results), 300); // Cache for 5 minutes
}

function getCachedResults(email) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(email);
  return cached ? JSON.parse(cached) : null;
}

function clearCache(email) {
  const cache = CacheService.getScriptCache();
  cache.remove(email);
}

function sendJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
