let signaturePad;
let patientData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Get patient data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    patientData = {
        firstName: urlParams.get('firstName') || '',
        lastName: urlParams.get('lastName') || '',
        email: urlParams.get('email') || '',
        responseId: urlParams.get('responseId') || '',
        insuranceProvider: urlParams.get('insuranceProvider') || '',
        documentId: urlParams.get('documentId') || ''
    };

    // Fill in patient information section
    const patientInfoSection = document.getElementById('patientInfoSection');
    if (patientInfoSection) {
        patientInfoSection.innerHTML = `
            <div class="patient-info">
                <p><strong>Patient Name:</strong> ${patientData.firstName} ${patientData.lastName}</p>
                <p><strong>Email:</strong> ${patientData.email}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                ${patientData.insuranceProvider ? `<p><strong>Insurance Provider:</strong> ${patientData.insuranceProvider}</p>` : ''}
            </div>
        `;
    }

    // Initialize signature pad
    const canvas = document.getElementById('signaturePad');
    if (canvas) {
        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        // Resize canvas
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.clear();
        }

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        // Clear signature button
        const clearButton = document.getElementById('clearButton');
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                signaturePad.clear();
            });
        }
    }

    // Form submission
    const consentForm = document.getElementById('consentForm');
    if (consentForm) {
        consentForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (signaturePad && signaturePad.isEmpty()) {
                alert('Please provide your signature before submitting.');
                return;
            }

            const privacyCheckbox = document.getElementById('privacy_acknowledgment');
            if (privacyCheckbox && !privacyCheckbox.checked) {
                alert('Please acknowledge that you have read and understand the Notice of Privacy Practices.');
                return;
            }

            const formData = {
                firstName: patientData.firstName,
                lastName: patientData.lastName,
                email: patientData.email,
                responseId: patientData.responseId,
                insuranceProvider: patientData.insuranceProvider,
                documentId: patientData.documentId,
                signatureData: signaturePad ? signaturePad.toDataURL() : '',
                signatureDate: new Date().toISOString(),
                privacyAcknowledged: true,
                formType: 'registration'
            };

            try {
                const response = await fetch('https://script.google.com/macros/s/AKfycbzWxMalG2rPihxQe6cQ2gbCdfSwL9yJWpNOdumFup5M7BeAXBdKjYXBfIx-6yPCJGHx/exec', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'success') {
                        alert('Thank you! Your consent form has been submitted successfully.');
                        // Redirect to a thank you page
                        window.location.href = '/thank-you.html';
                    } else {
                        throw new Error(result.message || 'Form submission failed');
                    }
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('There was an error submitting the form. Please try again or contact the clinic for assistance.');
            }
        });
    }
});
