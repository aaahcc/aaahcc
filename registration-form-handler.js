// Constants
const AAAHCC_FOLDER_ID = '1dXTHCGnZ0gwhpXOi27MOW9tkjv-uk-T6';
const INSURANCE_FOLDERS = {
  'First Health': '16zWdvFKf53TuNFr-o6BP3wTKDkXyqblM',
  'ASH': '1iigYt3vKyQQvtBsSEhv74rgfLbpzHfp7',
  'Accident': '1pRts5hiH5QZ6WJpW4U85NMsnIfPeEP4p',
  'Alignment': '1JL8Jvtz08kPhp1vQb9Ns4iM05wFLJvrZ',
  'Cigna': '12B9DaIPSjLGSLE2xixkdRQfO09y83R1E',
  'Aetna': '1owLJBvUtbrhPQ8das8Y9Wr_b0j_qfwDp',
  'BC': '1CaeBRr6k58aL47MpKZYaUx2KKCuDvaVJ',
  'BS': '1RZXRLZgN2WTdGI7olweTZvwzCgwT2-jk',
  'Cash': '1ngufJqzq1xJ26LX5fINAFl7ER7sGSTJG',
  'UHC': '1xTtSAKKF_33YNP3ZAESz8NiBP3jKI4eA',
  'WC': '1g0v7IF1KwQuq3APOUKzRnxeTC98cWHt6'
};
// Form IDs
const REGISTRATION_FORM_ID = '1BnDVYT3RrpH8dSLjA9h7xZKFEWK78IZSQMNVhteZD2o';  // Replace with your actual form ID


/*/ Helper function to convert insurance provider names for registration
function convertInsuranceProviderName(provider) {
  // Convert to lowercase for case-insensitive comparison
  const providerLower = provider.toLowerCase().trim();
 
  // Mapping of various insurance provider names to standardized names
  const providerMapping = {
    // First Health variations
    'first health': 'First Health',
    'firsthealth': 'First Health',
    'first-health': 'First Health',
   
    // ASH variations
    'ash': 'ASH',
    'american specialty health': 'ASH',
    'american specialty': 'ASH',
   
    // Accident variations
    'accident': 'Accident',
    'personal injury': 'Accident',
    'auto accident': 'Accident',
   
    // Alignment variations
    'alignment': 'Alignment',
    'alignment health': 'Alignment',
    'alignment health plan': 'Alignment',
   
    // Cigna variations
    'cigna': 'Cigna',
    'cigna health': 'Cigna',
    'cigna healthcare': 'Cigna',
   
    // Aetna variations
    'aetna': 'Aetna',
    'aetna health': 'Aetna',
    'aetna insurance': 'Aetna',
   
    // Blue Cross variations
    'blue cross': 'BC',
    'bluecross': 'BC',
    'bc': 'BC',
   
    // Blue Shield variations
    'blue shield': 'BS',
    'blueshield': 'BS',
    'bs': 'BS',
   
    // UnitedHealthcare variations
    'uhc': 'UHC',
    'united': 'UHC',
    'united healthcare': 'UHC',
    'unitedhealthcare': 'UHC',
    'united health': 'UHC',
   
    // Workers Compensation variations
    'wc': 'WC',
    'workers comp': 'WC',
    'workers compensation': 'WC',
    'workman comp': 'WC',
    'workman\'s comp': 'WC',
    'worker\'s compensation': 'WC'
  };
 
  return providerMapping[providerLower] || provider;
}
*/
function convertRegistrationInsuranceProviderName(provider) {
  if (!provider) return '';
 
  // Convert to lowercase for case-insensitive comparison
  const providerLower = provider.toLowerCase().trim();
 
  // Mapping of various insurance provider names to standardized names
  const providerMapping = {
    // Blue Cross variations
    'anthem blue cross': 'BC',
    'blue cross': 'BC',
    'bluecross': 'BC',
    'bc': 'BC',
   
    // Blue Shield variations
    'anthem blue shield': 'BS',
    'blue shield': 'BS',
    'blueshield': 'BS',
    'bs': 'BS',
   
    // UnitedHealthcare variations
    'united healthcare': 'UHC',
    'unitedhealthcare': 'UHC',
    'united health': 'UHC',
    'uhc': 'UHC',
   
    // Workers Compensation variations
    'workers compensation': 'WC',
    'workers comp': 'WC',
    'workman comp': 'WC',
    'wc': 'WC'
  };
 
  return providerMapping[providerLower] || provider;
}


function getRootFolderId(insuranceProvider) {
  if (!insuranceProvider) return AAAHCC_FOLDER_ID;
 
  // Get the standardized folder ID from the mapping
  const folderId = INSURANCE_FOLDERS[insuranceProvider];
 
  // Return the mapped folder ID or default to AAAHCC folder
  return folderId || AAAHCC_FOLDER_ID;
}


function createPatientFolder(firstName, lastName, insuranceProvider) {
  // Convert insurance provider to standardized format
  const standardizedProvider = convertRegistrationInsuranceProviderName(insuranceProvider);
 
  // Create folder name in lowercase for consistency
  const folderName = `${standardizedProvider}_${lastName}_${firstName}`.toLowerCase();
 
  // Get the root folder ID based on insurance
  const rootFolderId = getRootFolderId(standardizedProvider);
 
  try {
    // Get the root folder
    const rootFolder = DriveApp.getFolderById(rootFolderId);
   
    // Check if folder already exists
    const folders = rootFolder.getFoldersByName(folderName);
    let patientFolder;
   
    if (folders.hasNext()) {
      patientFolder = folders.next();
      console.log('Using existing folder:', folderName);
      Logger.log('Using existing folder: ' + folderName);
    } else {
      patientFolder = rootFolder.createFolder(folderName);
      console.log('Created new folder:', folderName);
      Logger.log('Created new folder: ' + folderName);
    }

    return {
      folder: patientFolder,
      folderId: patientFolder.getId()
    };
  } catch (error) {
    console.error('Error creating/finding folder:', error);
    Logger.log('Error creating/finding folder: ' + error);
    throw error;
  }
}


function handleRegistrationFormSubmission(formResponse) {
  console.log('=== REGISTRATION FORM SUBMISSION STARTED ===');
  Logger.log('=== REGISTRATION FORM SUBMISSION STARTED ===');

  if (!formResponse) {
    const error = 'Error: No registration form response data received';
    console.error(error);
    Logger.log(error);
    return;
  }

  try {
    const responses = formResponse.getItemResponses();
    let formData = {};
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
   
    console.log('=== REGISTRATION FORM FIELDS ===');
    Logger.log('=== REGISTRATION FORM FIELDS ===');
   
    // Process form responses
    responses.forEach(response => {
      const item = response.getItem();
      const title = item.getTitle();
      const answer = response.getResponse();
      formData[title] = answer;
      console.log(`Field Title: "${title}", Answer: "${answer}"`);
      Logger.log(`Field Title: "${title}", Answer: "${answer}"`);
    });

    // Create patient folder
    const { folder: patientFolder, folderId } = createPatientFolder(
      formData['First Name'],
      formData['Last Name'],
      formData['Insurance Provider']
    );

    // Send confirmation email
    sendRegistrationConfirmationEmail(
      formData['Email Address'],
      formData['First Name'],
      formData['Last Name'],
      formResponse
    );

    // Notify admin
    notifyAdminOfNewRegistration(
      formData['First Name'],
      formData['Last Name'],
      formData,
      { folder: patientFolder, folderId: folderId }
    );

    // Process consent form
    const responseId = formResponse.getId();
    sendRegistrationConsentFormEmail(
      formData['Email Address'],
      formData['First Name'],
      formData['Last Name'],
      responseId,
      formData
    );

    Logger.log('=== REGISTRATION FORM SUBMISSION COMPLETED SUCCESSFULLY ===');
    return true;
  } catch (error) {
    console.error('Error processing registration form submission:', error);
    Logger.log('Error processing registration form submission: ' + error);
    return false;
  }
}


function sendRegistrationConfirmationEmail(email, firstName, lastName, formResponse) {
  if (!email) return;
 
  // Get the edit URL directly from the form response
  const editUrl = formResponse.getEditResponseUrl();
 
  const subject = 'Welcome to Our Clinic - Registration Confirmation';
  const body = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <p>Dear ${firstName} ${lastName},</p>


  <p>Thank you for registering with our clinic. Your patient profile has been created successfully.</p>


  <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
    <p><strong>Important Links:</strong></p>
    <p>➤ <a href="${editUrl}">Click here to Review or Edit Your Registration</a></p>
    <p style="color: #666; font-size: 0.9em;">(Please update your information within 30 days if needed)</p>
  </div>


  <div style="margin: 20px 0;">
    <p><strong>Next steps:</strong></p>
    <ol>
      <li>You will receive a consent form via email shortly</li>
      <li>Complete and sign the consent form when you receive it</li>
      <li>Bring any relevant medical records to your first appointment</li>
      <li>Bring your ID and Insurance card to your first appointment</li>
    </ol>
  </div>


  <p>If you have any questions, please don't hesitate to contact us at (408) 475-5978.</p>


  <p>Best regards,<br>
  ALLCARE Acupuncture & Herb Clinic</p>
</div>`;


  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body,
    // Add plain text version for email clients that don't support HTML
    body: body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  });
  Logger.log(`Sent confirmation email to: ${email}`);
      // Send SMS notification
    const message = `New patient registration: ${firstName} ${lastName}`;
    MailApp.sendEmail("4085936847@vtext.com", "", message);

}


function notifyAdminOfNewRegistration(firstName, lastName, formData, patientFolderInfo) {
  try {
    const adminEmailBody = `
New Patient Registration Details:


Patient Information:
- Name: ${formData['First Name'] || ''} ${formData['Last Name'] || ''}
- Phone: ${formData['Phone Number (can receive text)'] || 'Not provided'}
- Email: ${formData['Email Address'] || 'Not provided'}
- Date of Birth: ${formData['Date of Birth'] || 'Not provided'}

Insurance Status:
- Has Insurance: ${formData['Do you have acupuncture insurance?'] || 'Not provided'}
- Provider: ${formData['Insurance Provider'] || 'Not provided'}
- Member ID: ${formData['Member ID'] || 'Not provided'}

Medical Information:
- Chief Complaint: ${formData['Chief Complain, current health problem(s)'] || 'Not provided'}
- Preferred Location: ${formData['Preferred  Office Location'] || 'Not provided'}

View patient folder:
${DriveApp.getFolderById(patientFolderInfo.folderId).getUrl()}

View all registrations:
https://docs.google.com/spreadsheets/d/19uXVF7N9MfjjzXlKVTopIO4qpi1BeQRH0r1caByVmdo/edit?usp=sharing`;

    MailApp.sendEmail({
      to: "linda@aaahcc.com",
      subject: `New Patient Registration: ${firstName} ${lastName}`,
      body: adminEmailBody
    });

    Logger.log('Admin notifications sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending admin notifications:', error);
    Logger.log('Error sending admin notifications: ' + error);
    return false;
  }
}


function createRegistrationConsentFormDocument(folder, consentData) {
  try {
    const { firstName, lastName, timestamp, email } = consentData;
    const documentName = `Consent Form - ${lastName}, ${firstName} (${timestamp})`;
    
    // Create the consent form document
    const doc = DocumentApp.create(documentName);
    const body = doc.getBody();
    
    // Add content to the document
    body.appendParagraph('PATIENT CONSENT FORM')
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        
    body.appendParagraph('\n');
    
    // Add patient information
    body.appendParagraph(`Patient Name: ${firstName} ${lastName}`);
    body.appendParagraph(`Date: ${new Date().toLocaleDateString()}`);
    
    body.appendParagraph('\n');
    
    // Add consent text sections
    body.appendParagraph('INFORMED CONSENT TO TREAT')
        .setHeading(DocumentApp.ParagraphHeading.HEADING2);
        
    body.appendParagraph(
      'I hereby request and consent to the performance of acupuncture treatments and other procedures ' +
      'within the scope of the practice of acupuncture on me (or on the patient named below, for whom I ' +
      'am legally responsible) by the acupuncturist indicated below and/or other licensed acupuncturists ' +
      'who now or in the future treat me while employed by, working or associated with or serving as ' +
      'back-up for the acupuncturist named below, including those working at the clinic or office listed ' +
      'below or any other office or clinic, whether signatories to this form or not.'
    );
    
    // Add signature section
    body.appendParagraph('\n\n');
    body.appendParagraph('Patient Signature: _________________________________');
    body.appendParagraph('Date: _________________');
    
    // Save and close the document
    doc.saveAndClose();
    
    // Move the document to the patient's folder
    const docFile = DriveApp.getFileById(doc.getId());
    folder.addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
    
    // Set edit permissions for the patient
    if (email) {
      docFile.addEditor(email);
      Logger.log(`Added editor permission for ${email} to document ${documentName}`);
    }
    
    return {
      document: doc,
      documentId: doc.getId(),
      documentUrl: doc.getUrl()
    };
  } catch (error) {
    console.error('Error creating consent form document:', error);
    Logger.log('Error creating consent form document: ' + error);
    throw error;
  }
}


function sendRegistrationConsentFormEmail(patientEmail, firstName, lastName, responseId, formData) {
  try {
    // Create patient folder if it doesn't exist
    const { folder, folderId } = createPatientFolder(firstName, lastName, formData['Insurance Provider']);
    
    // Generate consent form URL with parameters manually
    const params = [
      `firstName=${encodeURIComponent(firstName)}`,
      `lastName=${encodeURIComponent(lastName)}`,
      `email=${encodeURIComponent(patientEmail)}`,
      `responseId=${encodeURIComponent(responseId)}`,
      `insuranceProvider=${encodeURIComponent(formData['Insurance Provider'] || '')}`
    ].join('&');
    
    const consentFormUrl = `https://aaahcc.com/consent-form-aaahcc.html?${params}`;
    
    // Update tracking sheet
    const rowNumber = updateConsentFormTrackingSheet(firstName, lastName, patientEmail, responseId, formData);
    if (rowNumber) {
      updateTrackingSheetIDs(rowNumber, folderId, ''); // Document ID will be set when form is signed
    }
    
    // Send email with form link
    const subject = `Consent Form Needed - ${firstName} ${lastName}`;
    const body = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <p><strong>New Patient Registration - Consent Form Needed</strong></p>
  <p>Dear ${firstName} ${lastName},</p>
  <p>Thank you for registering with ALLCARE Acupuncture & Herb Clinic. Please click the button below to review and sign your consent form:</p>
  <p><a href="${consentFormUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign Consent Form</a></p>
  <p>If you have any questions, please don't hesitate to contact us.</p>
  <p>Best regards,<br>ALLCARE Acupuncture & Herb Clinic</p>
</div>`;
    
    MailApp.sendEmail({
      to: patientEmail,
      subject: subject,
      htmlBody: body
    });
    
    Logger.log(`Sent consent form email to ${patientEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending consent form email:', error);
    Logger.log('Error sending consent form email: ' + error);
    return false;
  }
}

function updateConsentFormTrackingSheet(firstName, lastName, email, responseId, formData) {
  try {
    const TRACKING_SHEET_ID = '1K0m9PHZi-p2rdVKrtZjBa3EpoK1-seaxo7l_wV-jcXw';
    console.log('Updating consent form tracking sheet');
    Logger.log('Updating consent form tracking sheet');
    
    const sheet = SpreadsheetApp.openById(TRACKING_SHEET_ID).getActiveSheet();
   
    // Add new row with patient data in the correct order
    const newRow = [
      new Date(), // Timestamp (Column A)
      email,      // Email (Column B)
      firstName,  // First Name (Column C)
      lastName,   // Last Name (Column D)
      responseId, // Response ID (Column E)
      false,      // Consent Form Sent Status (Column F)
      false,      // Send Action Status (Column G)
      '',         // Form Type Dropdown (Column H)
      '',         // Folder ID (Column I)
      ''          // Consent Form ID (Column J)
    ];
   
    // Append the row to the sheet
    const newRowRange = sheet.appendRow(newRow);
    const lastRow = sheet.getLastRow();
   
    // Set checkboxes in columns F and G
    var checkboxCell1 = sheet.getRange(lastRow, 6); // Column F
    var checkboxCell2 = sheet.getRange(lastRow, 7); // Column G
    checkboxCell1.insertCheckboxes();
    checkboxCell2.insertCheckboxes();
    
    // Set dropdown in column H
    var dropdownCell = sheet.getRange(lastRow, 8); // Column H
    var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['AAAHCC', 'ACUP'], true)
        .build();
    dropdownCell.setDataValidation(rule);
   
    Logger.log(`Added tracking entry for ${firstName} ${lastName}`);
    return lastRow; // Return the row number for later updates
  } catch (error) {
    console.error('Error updating tracking sheet:', error);
    Logger.log('Error updating tracking sheet: ' + error);
    return false;
  }
}

// Helper function to update folder and consent form IDs
function updateTrackingSheetIDs(rowNumber, folderId, consentFormId) {
  try {
    const TRACKING_SHEET_ID = '1K0m9PHZi-p2rdVKrtZjBa3EpoK1-seaxo7l_wV-jcXw';
    const sheet = SpreadsheetApp.openById(TRACKING_SHEET_ID).getActiveSheet();
    
    // Update Folder ID (Column I)
    if (folderId) {
      sheet.getRange(rowNumber, 9).setValue(folderId);
    }
    
    // Update Consent Form ID (Column J)
    if (consentFormId) {
      sheet.getRange(rowNumber, 10).setValue(consentFormId);
    }
    
    Logger.log(`Updated tracking sheet IDs for row ${rowNumber}`);
    return true;
  } catch (error) {
    console.error('Error updating tracking sheet IDs:', error);
    Logger.log('Error updating tracking sheet IDs: ' + error);
    return false;
  }
}


function onRegistrationFormSubmit(e) {
  console.log('=== REGISTRATION FORM SUBMISSION STARTED ===');
  Logger.log('=== REGISTRATION FORM SUBMISSION STARTED ===');
 
  try {
    if (!e || !e.response) {
      throw new Error('No form response data received');
    }


    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    const responseId = formResponse.getId();
   
    // Initialize form data object
    const formData = {};
   
    // Get all form responses
    itemResponses.forEach(response => {
      const title = response.getItem().getTitle();
      const answer = response.getResponse();
      formData[title] = answer;
    });
   
    console.log('Processing form for:', formData['First Name'], formData['Last Name']);
    Logger.log('Processing form for: ' + formData['First Name'] + ' ' + formData['Last Name']);
   
    // Create patient folder
    const patientFolder = createPatientFolder(
      formData['First Name'],
      formData['Last Name'],
      formData['Insurance Provider']
    );
   
    // Send confirmation email with formResponse for edit URL
    console.log('Sending confirmation email...');
    sendRegistrationConfirmationEmail(
      formData['Email Address'],
      formData['First Name'],
      formData['Last Name'],
      formResponse // Pass the entire formResponse object
    );
    console.log('Confirmation email sent.');
   //notify Admin New Registration
    console.log('notify Admin New Registration...');
    notifyAdminOfNewRegistration(formData['First Name'], formData['Last Name'], formData, patientFolder);
    
    // Send consent form notification and update tracking
    console.log('Processing consent form notification...');
    sendRegistrationConsentFormEmail(
      formData['Email Address'],
      formData['First Name'],
      formData['Last Name'],
      responseId,
      formData
    );
    console.log('Consent form notification processed.');
   
    // Log success
    console.log('=== REGISTRATION FORM SUBMISSION COMPLETED SUCCESSFULLY ===');
    Logger.log('=== REGISTRATION FORM SUBMISSION COMPLETED SUCCESSFULLY ===');
   
  } catch (error) {
    const errorMessage = `Error processing registration form: ${error.toString()}\nStack: ${error.stack}`;
    console.error(errorMessage);
    Logger.log(errorMessage);
  }
}


function processRegistrationConsentForm(consentData) {
  try {
    // Get the original form response
    const form = FormApp.getActiveForm();
    const response = form.getResponseById(consentData.formResponseId);
   
    // Get the patient's folder
    const folder = findRegistrationPatientFolder(consentData.patientName);
   
    if (!folder) {
      throw new Error('Patient registration folder not found');
    }
   
    // Save the signature
    saveRegistrationSignatureImage(folder, consentData.signatureData, `${consentData.patientName}_registration_signature`);
   
    // Create consent form document
    createRegistrationConsentFormDocument(folder, consentData);
   
    return true;
  } catch (error) {
    Logger.log('Error processing registration consent form: ' + error.toString());
    return false;
  }
}


function findRegistrationPatientFolder(patientName) {
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const folders = rootFolder.getFolders();
 
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.getName().includes(patientName)) {
      return folder;
    }
  }
 
  return null;
}


function createRegistrationSOAPNoteTemplate(folderName, firstName, lastName) {
  const folder = DriveApp.getFoldersByName(folderName).next();
  const template = DocumentApp.create(`SOAP Notes - ${firstName} ${lastName}`);
  const body = template.getBody();
 
  // Add SOAP note template content
  body.appendParagraph('SOAP Notes')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
 
  body.appendParagraph(`Patient: ${firstName} ${lastName}`);
  body.appendParagraph(`Date: ${new Date().toLocaleDateString()}`);
 
  // Add SOAP sections
  const sections = ['Subjective', 'Objective', 'Assessment', 'Plan'];
  sections.forEach(section => {
    body.appendParagraph(section)
        .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('');  // Add space for notes
  });
 
  // Move template to patient folder
  const file = DriveApp.getFileById(template.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}


function handleRegistrationAndCreateFolder(formData) {
  // Extract patient information
  const firstName = formData['First Name'] || '';
  const lastName = formData['Last Name'] || '';
  const insuranceStatus = formData['Insurance Status'] || 'Cash';
  const timestamp = new Date().toLocaleString();


  try {
    // Create patient folder using the standard pattern
    const patientFolder = createPatientFolder(firstName, lastName, insuranceStatus);
   
    // Create text file with form data
    const formDataContent = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
   
    const textFile = patientFolder.createFile(
      `Registration Form Data - ${firstName} ${lastName}.txt`,
      formDataContent
    );


    // Send admin notification
    const adminEmailBody = `
New Patient Registration (${timestamp})


Patient Information:
- Name: ${firstName} ${lastName}
- Insurance Status: ${insuranceStatus}


Form Details:
${formDataContent}


Folder Link:
${patientFolder.getUrl()}`;


    MailApp.sendEmail({
      to: "linda@aaahcc.com,jasonjinxiao@gmail.com",
      subject: `New Patient Registration: ${firstName} ${lastName}`,
      body: adminEmailBody
    });


    // Send SMS notification
    const message = `New patient registration: ${firstName} ${lastName}`;
    MailApp.sendEmail("4085936847@vtext.com", "", message);


    console.log(`Created/Updated folder: ${patientFolder.getName()}`);
    Logger.log(`Created/Updated folder: ${patientFolder.getName()}`);


    return patientFolder;
  } catch (error) {
    console.error('Error creating folder:', error);
    Logger.log('Error creating folder: ' + error.toString());
    throw error;
  }
}


function setupRegistrationFormTrigger() {
  // Delete any existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onRegistrationFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });


  // Create new trigger
  const form = FormApp.openById(REGISTRATION_FORM_ID);
  ScriptApp.newTrigger('onRegistrationFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
   
  console.log('Registration form trigger set up successfully');
  Logger.log('Registration form trigger set up successfully');
}


// Run this function manually to set up the trigger
function setupAllTriggers() {
  setupRegistrationFormTrigger();
  console.log('All triggers set up successfully');
  Logger.log('All triggers set up successfully');
}
