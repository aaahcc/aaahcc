function doPost(e) {
  try {
    // Parse the incoming form data
    const formData = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!formData.responseId || !formData.email || !formData.signatureData) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Get the patient's folder
    const folderName = `${formData.firstName} ${formData.lastName}`;
    const folders = DriveApp.getFoldersByName(folderName);
    let patientFolder;
    
    if (folders.hasNext()) {
      patientFolder = folders.next();
    } else {
      // Create folder if it doesn't exist
      patientFolder = DriveApp.createFolder(folderName);
    }

    // Create PDF with signature
    const pdfBlob = createSignedConsentPDF(formData);
    const pdfFile = patientFolder.createFile(pdfBlob);
    
    // Update tracking sheet
    updateConsentFormStatus(formData.responseId, pdfFile.getId(), 'Signed');

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Consent form processed successfully',
      documentId: pdfFile.getId()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing consent form:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Internal server error'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createSignedConsentPDF(formData) {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .signature { margin-top: 20px; }
          .patient-info { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ALLCARE Acupuncture & Herb Clinic</h1>
          <h2>Patient Consent Form</h2>
        </div>
        
        <div class="patient-info">
          <p><strong>Patient Name:</strong> ${formData.firstName} ${formData.lastName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          ${formData.insuranceProvider ? `<p><strong>Insurance Provider:</strong> ${formData.insuranceProvider}</p>` : ''}
        </div>

        <div class="consent-text">
          <!-- Add your consent form text here -->
          <h3>Consent for Treatment</h3>
          <p>I hereby consent to the performance of acupuncture treatments and other procedures within the scope of the practice of acupuncture...</p>
          
          <h3>Notice of Privacy Practices Acknowledgment</h3>
          <p>I acknowledge that I have been provided access to ALLCARE Acupuncture & Herb Clinic's Notice of Privacy Practices...</p>
        </div>

        <div class="signature">
          <p><strong>Patient Signature:</strong></p>
          <img src="${formData.signatureData}" width="300" />
          <p><strong>Date:</strong> ${new Date(formData.signatureDate).toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;

  // Convert HTML to PDF
  const blob = Utilities.newBlob(htmlContent, 'text/html', 'consent.html');
  const pdf = blob.getAs('application/pdf');
  pdf.setName(`Consent_Form_${formData.firstName}_${formData.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
  
  return pdf;
}

function updateConsentFormStatus(responseId, documentId, status) {
  try {
    // Open the tracking sheet
    const sheet = SpreadsheetApp.openById('1K0m9PHZi-p2rdVKrtZjBa3EpoK1-seaxo7l_wV-jcXw').getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Find the row with matching responseId
    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][3] === responseId) { // Assuming responseId is in column D (index 3)
        rowIndex = i + 1; // Add 1 because sheet rows are 1-based
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`No record found for responseId: ${responseId}`);
    }
    
    // Update the consent form ID and status
    sheet.getRange(rowIndex, 9).setValue(documentId); // Column I for document ID
    sheet.getRange(rowIndex, 10).setValue(status); // Column J for status
    sheet.getRange(rowIndex, 11).setValue(new Date()); // Column K for timestamp
    
    Logger.log(`Updated consent form status for responseId ${responseId}: ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating consent form status:', error);
    Logger.log('Error updating consent form status: ' + error);
    return false;
  }
}

// Test function to simulate form submission
function testConsentFormSubmission() {
  const testData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    responseId: "TEST123",
    insuranceProvider: "Test Insurance",
    signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // Simulated signature data
    signatureDate: new Date().toISOString(),
    privacyAcknowledged: true,
    formType: 'registration'
  };

  // Simulate POST request event
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  // Call doPost with simulated event
  const result = doPost(e);
  
  // Log the result
  console.log('Test submission result:', JSON.parse(result.getContent()));
}

// Function to test PDF creation separately
function testPDFCreation() {
  const testData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    insuranceProvider: "Test Insurance",
    signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // Simulated signature data
    signatureDate: new Date().toISOString()
  };

  try {
    const pdfBlob = createSignedConsentPDF(testData);
    const testFolder = DriveApp.createFolder("Test_Consent_Forms");
    const file = testFolder.createFile(pdfBlob);
    console.log('PDF created successfully. File ID:', file.getId());
    console.log('File URL:', file.getUrl());
  } catch (error) {
    console.error('Error creating PDF:', error);
  }
}
