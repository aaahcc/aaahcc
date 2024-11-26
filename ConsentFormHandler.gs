// Replace with your root folder ID where patient folders are stored
const ROOT_FOLDER_ID = 'YOUR_ROOT_FOLDER_ID';

function onFormSubmit(e) {
  try {
    // Get form response
    const response = e.response;
    const itemResponses = response.getItemResponses();
    
    // Extract data
    let patientName = '';
    let email = '';
    let signatureData = '';
    let formResponseId = '';
    
    itemResponses.forEach(itemResponse => {
      const question = itemResponse.getItem().getTitle().toLowerCase();
      const answer = itemResponse.getResponse();
      
      if (question.includes('patient name')) {
        patientName = answer;
      } else if (question.includes('email')) {
        email = answer;
      } else if (question.includes('digital signature')) {
        signatureData = answer;
      } else if (question.includes('form response id')) {
        formResponseId = answer;
      }
    });
    
    // Find existing patient folder
    const folder = findPatientFolder(patientName);
    if (!folder) {
      throw new Error(`Patient folder not found for: ${patientName}`);
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const signatureFilename = `${patientName}_signature_${timestamp}.png`;
    const consentFilename = `${patientName}_consent_form_${timestamp}.pdf`;
    
    // Save signature as PNG
    if (signatureData) {
      saveSignature(folder, signatureData, signatureFilename);
    }
    
    // Create consent form PDF
    createConsentPDF(folder, {
      patientName: patientName,
      email: email,
      date: timestamp,
      signatureFilename: signatureFilename,
      outputFilename: consentFilename
    });
    
    // Send confirmation email
    sendConfirmationEmail(email, patientName);
    
  } catch (error) {
    Logger.log('Error processing consent form: ' + error.toString());
    // You might want to send an error notification email here
  }
}

function findPatientFolder(patientName) {
  const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const folders = rootFolder.getFolders();
  
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.getName().includes(patientName)) {
      return folder;
    }
  }
  
  return null;
}

function saveSignature(folder, signatureData, filename) {
  // Remove the data URL prefix
  const base64Data = signatureData.split(',')[1];
  
  // Create blob from base64 data
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', filename);
  
  // Save to folder
  folder.createFile(blob);
}

function createConsentPDF(folder, data) {
  // Create Google Doc
  const doc = DocumentApp.create(`Consent Form - ${data.patientName}`);
  const body = doc.getBody();
  
  // Add header
  body.appendParagraph('TREATMENT CONSENT FORM')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      
  // Add clinic info
  body.appendParagraph('Allcare Acupuncture & Herb Clinic')
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  // Add patient info section
  body.appendParagraph('\nPATIENT INFORMATION')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(`Patient Name: ${data.patientName}`);
  body.appendParagraph(`Date: ${new Date(data.date).toLocaleDateString()}`);
  body.appendParagraph(`Email: ${data.email}`);
  
  // Add consent text
  body.appendParagraph('\nINFORMED CONSENT TO TREAT')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  // Add your full consent text here
  body.appendParagraph(`
I hereby request and consent to the performance of acupuncture treatments and other procedures within the scope of the practice of acupuncture on me (or on the patient named below, for whom I am legally responsible) by the acupuncturist indicated below and/or other licensed acupuncturists who now or in the future treat me while employed by, working or associated with or serving as back-up for the acupuncturist named below, including those working at the clinic or office listed below or any other office or clinic, whether signatories to this form or not.

I understand that methods of treatment may include, but are not limited to, acupuncture, moxibustion, cupping, electrical stimulation, Tui-Na (Chinese massage), Chinese herbal medicine, and nutritional counseling.

I understand that the herbs may need to be prepared and the teas consumed according to the instructions provided orally and in writing. The herbs may have an unpleasant smell or taste. I will immediately notify a member of the clinical staff of any unanticipated or unpleasant effects associated with the consumption of the herbs.

I have been informed that acupuncture is a generally safe method of treatment, but that it may have some side effects, including bruising, numbness or tingling near the needling sites that may last a few days, and dizziness or fainting. Burns and/or scarring are a potential risk of moxibustion and cupping, or when treatment involves the use of heat lamps. Bruising is a common side effect of cupping. Unusual risks of acupuncture include spontaneous miscarriage, nerve damage and organ puncture, including lung puncture (pneumothorax). Infection is another possible risk, although the clinic uses sterile disposable needles and maintains a clean and safe environment.

I understand that while this document describes the major risks of treatment, other side effects and risks may occur. The herbs and nutritional supplements (which are from plant, animal and mineral sources) that have been recommended are traditionally considered safe in the practice of Chinese Medicine, although some may be toxic in large doses. I understand that some herbs may be inappropriate during pregnancy. Some possible side effects of taking herbs are nausea, gas, stomachache, vomiting, headache, diarrhea, rashes, hives, and tingling of the tongue. I will notify a clinical staff member who is caring for me if I am or become pregnant.

While I do not expect the clinical staff to be able to anticipate and explain all possible risks and complications of treatment, I wish to rely on the clinical staff to exercise judgment during the course of treatment which the clinical staff thinks at the time, based upon the facts then known, is in my best interest. I understand that results are not guaranteed.

I understand the clinical and administrative staff may review my patient records and lab reports, but all my records will be kept confidential and will not be released without my written consent.

By voluntarily signing below, I show that I have read, or have had read to me, the above consent to treatment, have been told about the risks and benefits of acupuncture and other procedures, and have had an opportunity to ask questions. I intend this consent form to cover the entire course of treatment for my present condition and for any future condition(s) for which I seek treatment.`);

  // Add signature section
  body.appendParagraph('\nSIGNATURE')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(`Patient Signature: [See attached signature file: ${data.signatureFilename}]`);
  body.appendParagraph(`Date: ${new Date(data.date).toLocaleDateString()}`);
  
  // Save as PDF
  doc.saveAndClose();
  
  // Convert to PDF and move to patient folder
  const docFile = DriveApp.getFileById(doc.getId());
  const pdfFile = folder.createFile(docFile.getAs('application/pdf'));
  pdfFile.setName(data.outputFilename);
  
  // Delete original Google Doc
  docFile.setTrashed(true);
}

function sendConfirmationEmail(email, patientName) {
  const subject = 'Consent Form Received - Allcare Acupuncture & Herb Clinic';
  const body = `Dear ${patientName},

Thank you for submitting your signed consent form. We have received it and added it to your patient records.

Your consent form and signature have been securely stored in our system.

If you have any questions or need to update your information, please don't hesitate to contact us.

Best regards,
Allcare Acupuncture & Herb Clinic`;

  MailApp.sendEmail(email, subject, body);
}
