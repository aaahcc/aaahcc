const ROOT_FOLDER_ID = '1gvr3ZKdK2Dye-sW13X_rk1hMIL8LzXg0';
const INSURANCE_FOLDER_ID = '1dXTHCGnZ0gwhpXOi27MOW9tkjv-uk-T6';
const FORM_ID = 'YOUR_FORM_ID_HERE'; // Replace with your actual form ID

function createInsuranceFolders() {
  try {
    const insuranceFolder = DriveApp.getFolderById(INSURANCE_FOLDER_ID);
    
    // List of folders to create
    const foldersToCreate = [
      'first-health',
      'ash',
      'accident',
      'alignment',
      'cigna',
      'aetna',
      'bc',
      'bs',
      'cash',
      'uhc',
      'wc',
      'template'
    ];
    
    const createdFolders = [];
    
    // Create each folder and log the result
    foldersToCreate.forEach(folderName => {
      try {
        // Check if folder already exists
        const existingFolders = insuranceFolder.getFoldersByName(folderName);
        let folder;
        
        if (existingFolders.hasNext()) {
          folder = existingFolders.next();
          Logger.log(`Folder already exists: ${folderName}`);
        } else {
          folder = insuranceFolder.createFolder(folderName);
          Logger.log(`Created folder: ${folderName}`);
        }
        
        createdFolders.push({
          name: folderName,
          id: folder.getId(),
          url: folder.getUrl()
        });
      } catch (error) {
        Logger.log(`Error creating folder ${folderName}: ${error.toString()}`);
      }
    });
    
    // Create a spreadsheet with the results
    const spreadsheet = SpreadsheetApp.create('Insurance Folders List - ' + new Date().toLocaleString());
    const sheet = spreadsheet.getActiveSheet();
    
    // Add headers
    sheet.getRange('A1:C1').setValues([['Folder Name', 'Folder ID', 'URL']]);
    
    // Add data
    if (createdFolders.length > 0) {
      const foldersData = createdFolders.map(folder => [folder.name, folder.id, folder.url]);
      sheet.getRange(2, 1, foldersData.length, 3).setValues(foldersData);
    }
    
    // Format sheet
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 3);
    
    Logger.log('Spreadsheet created: ' + spreadsheet.getUrl());
    return {
      success: true,
      message: `Created ${createdFolders.length} folders`,
      spreadsheetUrl: spreadsheet.getUrl()
    };
    
  } catch (error) {
    Logger.log(`Error in createInsuranceFolders: ${error.toString()}`);
    return {
      success: false,
      message: error.toString()
    };
  }
}

function listSubfolders() {
  const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const subfolders = [];
  
  // Get immediate subfolders
  const folderIterator = rootFolder.getFolders();
  while (folderIterator.hasNext()) {
    const folder = folderIterator.next();
    subfolders.push({
      name: folder.getName(),
      id: folder.getId(),
      url: folder.getUrl()
    });
  }
  
  // Create a new spreadsheet to store the results
  const spreadsheet = SpreadsheetApp.create('Subfolders List - ' + new Date().toLocaleString());
  const sheet = spreadsheet.getActiveSheet();
  
  // Add headers
  sheet.getRange('A1:C1').setValues([['Folder Name', 'Folder ID', 'URL']]);
  
  // Add subfolders data
  if (subfolders.length > 0) {
    const subfoldersData = subfolders.map(folder => [folder.name, folder.id, folder.url]);
    sheet.getRange(2, 1, subfoldersData.length, 3).setValues(subfoldersData);
  }
  
  // Format sheet
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);
  
  // Log results
  console.log('Subfolders found:', subfolders.length);
  subfolders.forEach(folder => {
    console.log(`
Folder Name: ${folder.name}
Folder ID: ${folder.id}
URL: ${folder.url}
-------------------`);
  });
  
  Logger.log('Spreadsheet created: ' + spreadsheet.getUrl());
  return spreadsheet.getUrl();
}

function getFormField(formResponse, fieldTitle) {
  const items = formResponse.getItemResponses();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const question = item.getItem().getTitle();
    if (question === fieldTitle) {
      return item.getResponse();
    }
  }
  return null;
}

function getFormData(formResponse) {
  return {
    firstName: getFormField(formResponse, 'First Name'),
    lastName: getFormField(formResponse, 'Last Name'),
    email: getFormField(formResponse, 'Email'),
    phoneNumber: getFormField(formResponse, 'Phone Number (can receive text) '),
    phoneCarrier: getFormField(formResponse, 'Phone Carrier'),
    insuranceProvider: getFormField(formResponse, 'Insurance Provider')
  };
}

function getPhoneNumber(formResponse) {
  const items = formResponse.getItemResponses();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const question = item.getItem().getTitle();
    if (question === 'Phone Number (can receive text) ') {
      return item.getResponse();
    }
  }
  return null; // Return null if no phone number found
}

function getPhoneNumbers() {
  const form = FormApp.openById(FORM_ID); // Make sure FORM_ID is defined at the top
  const formResponses = form.getResponses();
  const phoneNumbers = [];
  
  formResponses.forEach(response => {
    const phoneNumber = getPhoneNumber(response);
    if (phoneNumber) {
      phoneNumbers.push({
        phoneNumber: phoneNumber,
        timestamp: response.getTimestamp()
      });
    }
  });
  
  // Log the results
  console.log('Found ' + phoneNumbers.length + ' phone numbers');
  phoneNumbers.forEach(entry => {
    console.log(`Phone: ${entry.phoneNumber}, Submitted: ${entry.timestamp}`);
  });
  
  return phoneNumbers;
}

function onFormSubmit(e) {
  const formResponse = e.response;
  const formData = getFormData(formResponse);
  
  if (formData) {
    console.log('Form submitted with data:', formData);
    // Add your form handling logic here
  }
}

function createFormTrigger() {
  const form = FormApp.openById(FORM_ID);
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
  console.log('Form submission trigger created successfully');
}
