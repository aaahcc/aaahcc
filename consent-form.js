let signaturePad;
let patientData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Get patient data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    patientData = {
        firstName: urlParams.get('firstName') || '',
        lastName: urlParams.get('lastName') || '',
        email: urlParams.get('email') || '',
        formResponseId: urlParams.get('responseId') || ''
    };

    // Set patient name and current date
    document.getElementById('patientName').textContent = `${patientData.firstName} ${patientData.lastName}`;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();

    // Initialize signature pad
    const canvas = document.getElementById('signaturePad');
    initializeSignaturePad(canvas);

    // Add event listeners
    document.getElementById('clearSignature').addEventListener('click', function() {
        signaturePad.clear();
    });

    document.getElementById('submitConsent').addEventListener('click', submitConsentForm);
});

function initializeSignaturePad(canvas) {
    // Set canvas dimensions based on container size
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
    }

    // Initialize signature pad
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 0.5,
        maxWidth: 2.5
    });

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

async function submitConsentForm() {
    if (signaturePad.isEmpty()) {
        alert('Please provide your signature before submitting.');
        return;
    }

    try {
        // Get signature as base64 image
        const signatureData = signaturePad.toDataURL();
        
        // Get current date for filename
        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `${patientData.firstName}_${patientData.lastName}_Consent_${currentDate}.pdf`;
        
        // Google Form submission URL
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSd8hS4jrpLJ8IKKLfOkDm-6jKX4-Sv3YZ10GWuVeT1YK0_YhQ/formResponse';
        
        // Create URL parameters for the Google Form
        const params = new URLSearchParams({
            'entry.793140059': `${patientData.firstName} ${patientData.lastName}`, // Patient Name
            'entry.2087935553': patientData.email,                                 // Email Address
            'entry.183935946': patientData.formResponseId,                         // Original Form Response ID
            'entry.450979518': signatureData,                                      // Digital Signature Data
            'filename': fileName                                                    // Add filename for reference
        });

        // Create a hidden form and submit it
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = formUrl;
        
        // Handle CORS by submitting to a hidden iframe
        const frameName = 'hidden_iframe';
        const iframe = document.createElement('iframe');
        iframe.name = frameName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        form.target = frameName;

        // Add hidden inputs for each parameter
        params.forEach((value, key) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        // Add form to document and submit it
        document.body.appendChild(form);
        
        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.textContent = 'Submitting your consent form...';
        document.body.appendChild(loadingMessage);

        // Submit the form
        form.submit();

        // Wait a moment to ensure the form submission has started
        setTimeout(() => {
            // Clean up
            document.body.removeChild(form);
            document.body.removeChild(loadingMessage);
            document.body.removeChild(iframe);

            // Save signature locally
            localStorage.setItem('lastSignature', signatureData);
            
            // Show success message and redirect
            handleSubmissionSuccess();
        }, 2000);

    } catch (error) {
        console.error('Error submitting consent form:', error);
        handleSubmissionError(error);
    }
}

function handleSubmissionSuccess() {
    alert('Thank you! Your consent form has been submitted successfully.');
    window.location.href = 'thank-you.html';
}

function handleSubmissionError(error) {
    console.error('Error:', error);
    alert('An error occurred while submitting the form. Please try again. If the problem persists, please contact us.');
}
