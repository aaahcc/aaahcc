# ALLCARE Acupuncture & Herb Clinic - Form Handling System

A Google Apps Script-based form handling system for patient registration and insurance verification.

## Features

- Patient Registration Form Processing
- Insurance Verification
- Automated Folder Management
- Email Notifications
- Consent Form Handling
- SOAP Note Template Generation

## File Structure

- `registration-form-handler.js`: Main registration form submission handler
- `form-handler-registration.js`: Form handling utilities
- `ListAllForms.gs`: Form listing functionality
- `FormSearchHandler.gs`: Form search functionality
- `consent-form.js`: Consent form processing

## Setup

1. Deploy as Google Apps Script Web App
2. Set up form triggers
3. Configure folder IDs and email settings

## Configuration

- Registration Form ID: `1BnDVYT3RrpH8dSLjA9h7xZKFEWK78IZSQMNVhteZD2o`
- Root Folders configured for different insurance providers
- Email notifications configured for admin and patients

## Required OAuth Scopes

- https://www.googleapis.com/auth/drive
- https://www.googleapis.com/auth/forms.currentonly
- https://www.googleapis.com/auth/script.send_mail
