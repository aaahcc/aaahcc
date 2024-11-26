document.addEventListener('DOMContentLoaded', function() {
    // Initialize signature pad
    const canvas = document.getElementById('signaturePad');
    const signaturePad = new SignaturePad(canvas, {
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
    document.getElementById('clearButton').addEventListener('click', function() {
        signaturePad.clear();
    });

    // Form submission
    document.getElementById('consentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (signaturePad.isEmpty()) {
            alert('Please provide a signature before submitting the form.');
            return;
        }

        const formData = {
            patientName: document.getElementById('patientName').value,
            signatureDate: document.getElementById('signatureDate').value,
            signatureData: signaturePad.toDataURL(),
            privacyAcknowledged: document.getElementById('privacy_acknowledgment').checked,
            clinic: 'ACUP HEALTH CENTER'
        };

        try {
            // Replace with your actual form submission endpoint
            const response = await fetch('YOUR_FORM_SUBMISSION_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Form submitted successfully!');
                // Optionally redirect to a thank you page or clear the form
                signaturePad.clear();
                this.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting the form. Please try again.');
        }
    });
});
