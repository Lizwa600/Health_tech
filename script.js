
// Sample patient data for demonstration (in production, this comes from Firebase)
const samplePatientData = {
 '0211120351080': {
 name: 'Alice Johnson',
 dob: '1995-07-20',
 phone: '+27-82-123-4567',
 idNumber: '0211120351080',
 folder: [
 { type: 'document', title: 'Consultation Report - 2023-10-15', content: 'Patient presented with a persistent cough and fatigue. Prescribed antibiotics and advised rest.' },
 { type: 'document', title: 'Lab Results - 2023-09-28', content: 'Blood tests show normal white blood cell count. Cholesterol levels are slightly elevated.' },
 { type: 'image', title: 'Chest X-ray Scan - 2023-10-14', content: 'https://placehold.co/400x300/e2e8f0/000000?text=Chest+X-ray' },
 { type: 'document', title: 'Allergy Information', content: 'Patient has a known allergy to penicillin.' },
 { type: 'document', title: 'Prescription - 2023-11-05', content: 'Medication: Paracetamol, 500mg. Dosage: One tablet every 6 hours as needed for pain.' }
 ]
 },
 '8803121234567': {
 name: 'Bob Williams',
 dob: '1988-03-12',
 phone: '+27-83-234-5678',
 idNumber: '8803121234567',
 folder: [
 { type: 'document', title: 'Physical Examination Report - 2024-01-20', content: 'Routine check-up. Patient is in good health with no major concerns. Advised to maintain a healthy diet and regular exercise.' },
 { type: 'document', title: 'Vaccination History', content: 'Received annual flu shot on 2023-11-01. All childhood immunizations are up-to-date.' }
 ]
 },
 '7501251234567': {
 name: 'Charlie Davis',
 dob: '1975-01-25',
 phone: '+27-84-345-6789',
 idNumber: '7501251234567',
 folder: [
 { type: 'document', title: 'Cardiology Report - 2023-06-10', content: 'Patient reports occasional palpitations. ECG results are stable. Recommended follow-up in 6 months.' }
 ]
 }
};

// Current user session data
let currentPatient = null;
let generatedOTP = null;
let otpExpiry = null;



// Main sections
const patientFlow = document.getElementById('patient-flow');
const recordsContainer = document.getElementById('records-container');

// Patient flow steps
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');

// Input fields
const patientIdInput = document.getElementById('patient-id-input');
const patientNameDisplay = document.getElementById('patient-name-display');
const otpInput = document.getElementById('otp-input');

// Display areas
const recordsDisplay = document.getElementById('records-display');
const messageArea = document.getElementById('message-area');

// Scanning modal elements
const scanModal = document.getElementById('scan-modal');
const scanDocumentButton = document.getElementById('scan-document-button');
const closeScanModal = document.getElementById('close-scan-modal');
const cancelScan = document.getElementById('cancel-scan');
const fileUpload = document.getElementById('file-upload');
const cameraCapture = document.getElementById('camera-capture');
const documentTitle = document.getElementById('document-title');
const documentType = document.getElementById('document-type');
const documentNotes = document.getElementById('document-notes');
const filePreview = document.getElementById('file-preview');
const previewList = document.getElementById('preview-list');
const uploadDocuments = document.getElementById('upload-documents');



// Patient authentication flow
document.getElementById('verify-id-button').addEventListener('click', verifyPatientId);
document.getElementById('confirm-patient-button').addEventListener('click', confirmPatientIdentity);
document.getElementById('deny-patient-button').addEventListener('click', denyPatientIdentity);
document.getElementById('verify-otp-button').addEventListener('click', verifyOTP);
document.getElementById('resend-otp-button').addEventListener('click', resendOTP);

// Logout
document.getElementById('logout-button').addEventListener('click', logout);

// Document scanning
scanDocumentButton.addEventListener('click', openScanModal);
closeScanModal.addEventListener('click', closeScanModalHandler);
cancelScan.addEventListener('click', closeScanModalHandler);
fileUpload.addEventListener('change', handleFileSelection);
cameraCapture.addEventListener('change', handleFileSelection);
uploadDocuments.addEventListener('click', uploadDocumentsToPatient);


// Show success or error messages to user
function showMessage(message, type = 'error') {
 messageArea.textContent = message;
 const colorClass = type === 'error' ? 'text-red-500' : 'text-green-500';
 messageArea.className = `text-center text-sm font-medium mb-4 h-6 ${colorClass}`;
}

// Clear message area
function hideMessage() {
 messageArea.textContent = '';
 messageArea.className = 'text-center text-sm font-medium mb-4 h-6';
}

// Generate random 6-digit OTP
function generateOTP() {
 return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if OTP has expired (5 minutes)
function isOTPExpired() {
 return otpExpiry && Date.now() > otpExpiry;
}


// Validate South African ID number format
function validateSAIdNumber(idNumber) {
 // Remove any spaces or dashes
 const cleanId = idNumber.replace(/[\s-]/g, '');

 // Check if it's exactly 13 digits
 if (!/^\d{13}$/.test(cleanId)) {
 return { valid: false, error: 'ID number must be exactly 13 digits' };
 }

 // Check if it's not all zeros
 if (cleanId === '0000000000000') {
 return { valid: false, error: 'Invalid ID number' };
 }

 // Basic date validation (YYMMDD format in first 6 digits)
 const year = parseInt(cleanId.substring(0, 2));
 const month = parseInt(cleanId.substring(2, 4));
 const day = parseInt(cleanId.substring(4, 6));

 if (month < 1 || month > 12) {
 return { valid: false, error: 'Invalid birth month in ID number' };
 }

 if (day < 1 || day > 31) {
 return { valid: false, error: 'Invalid birth day in ID number' };
 }

 return { valid: true, cleanId: cleanId };
}


// Get patient data from Firebase (with fallback to sample data)
async function getPatientFromFirebase(idNumber) {
 try {
 // Check if Firebase is available
 if (window.db) {
 const patientRef = doc(window.db, 'patients', idNumber);
 const patientSnap = await getDoc(patientRef);

 if (patientSnap.exists()) {
 return patientSnap.data();
 }
 }

 // Fallback to sample data for demonstration
 return samplePatientData[idNumber] || null;
 } catch (error) {
 console.error('Error fetching patient data:', error);
 // Fallback to sample data
 return samplePatientData[idNumber] || null;
 }
}


// ============================================================================
// UI FLOW FUNCTIONS
// ============================================================================

// Reset patient flow to step 1
function resetPatientFlow() {
 step1.classList.remove('hidden');
 step2.classList.add('hidden');
 step3.classList.add('hidden');
 patientIdInput.value = '';
 otpInput.value = '';
 currentPatient = null;
 generatedOTP = null;
 otpExpiry = null;
 hideMessage();
}


// Step 1: Verify patient ID and show name confirmation
async function verifyPatientId() {
 const idNumber = patientIdInput.value.trim();
 hideMessage();

 // Check if ID is entered
 if (!idNumber) {
 showMessage('Please enter your ID number.');
 return;
 }

 // Validate South African ID number format
 const validation = validateSAIdNumber(idNumber);
 if (!validation.valid) {
 showMessage(validation.error);
 return;
 }

 // Show loading message
 showMessage('Verifying ID number...', 'success');

 try {
 // Look up patient in Firebase (with fallback to sample data)
 const patient = await getPatientFromFirebase(validation.cleanId);

 if (patient) {
 currentPatient = patient;
 patientNameDisplay.textContent = patient.name;

 // Move to step 2 (name confirmation)
 step1.classList.add('hidden');
 step2.classList.remove('hidden');
 showMessage(`Patient found: ${patient.name}`, 'success');
 } else {
 showMessage('ID number not found in our records. Please contact your healthcare provider.');
 }
 } catch (error) {
 console.error('Error verifying patient ID:', error);
 showMessage('Error verifying ID number. Please try again.');
 }
}

// Step 2: Confirm patient identity and send OTP
function confirmPatientIdentity() {
 if (currentPatient) {
 // Generate OTP and set expiry (5 minutes)
 generatedOTP = generateOTP();
 otpExpiry = Date.now() + (5 * 60 * 1000);

 // Move to step 3 (OTP verification)
 step2.classList.add('hidden');
 step3.classList.remove('hidden');
 showMessage(`OTP sent to ${currentPatient.phone}. Code: ${generatedOTP} (Demo)`, 'success');
 }
}

// Step 2: Deny patient identity and restart
function denyPatientIdentity() {
 resetPatientFlow();
 showMessage('Please enter the correct Patient ID.');
}

// Step 3: Verify OTP and grant access
function verifyOTP() {
 const enteredOTP = otpInput.value.trim();
 hideMessage();

 // Check if OTP is entered
 if (!enteredOTP) {
 showMessage('Please enter the OTP.');
 return;
 }

 // Check if OTP has expired
 if (isOTPExpired()) {
 showMessage('OTP has expired. Please request a new one.');
 return;
 }

 // Verify OTP
 if (enteredOTP === generatedOTP) {
 showMessage('OTP verified successfully!', 'success');

 // Show patient records after 1 second delay
 setTimeout(() => {
 renderRecords(currentPatient);
 patientFlow.classList.add('hidden');
 recordsContainer.classList.remove('hidden');
 }, 1000);
 } else {
 showMessage('Invalid OTP. Please try again.');
 }
}

// Resend OTP with new code
function resendOTP() {
 if (currentPatient) {
 generatedOTP = generateOTP();
 otpExpiry = Date.now() + (5 * 60 * 1000);
 showMessage(`New OTP sent to ${currentPatient.phone}. Code: ${generatedOTP} (Demo)`, 'success');
 }
}


// Clear all session data and return to main screen
function logout() {
 // Clear session variables
 currentPatient = null;
 generatedOTP = null;
 otpExpiry = null;

 // Hide records and show patient flow
 recordsContainer.classList.add('hidden');
 patientFlow.classList.remove('hidden');

 // Reset patient form
 resetPatientFlow();
}


// Global variable to store selected files
let selectedFiles = [];

// Open the scanning modal
function openScanModal() {
 if (!currentPatient) {
 showMessage('Please authenticate first.');
 return;
 }

 scanModal.classList.remove('hidden');
 resetScanForm();
}

// Close the scanning modal
function closeScanModalHandler() {
 scanModal.classList.add('hidden');
 resetScanForm();
}

// Reset the scanning form
function resetScanForm() {
 selectedFiles = [];
 documentTitle.value = '';
 documentType.value = 'document';
 documentNotes.value = '';
 filePreview.classList.add('hidden');
 previewList.innerHTML = '';
 fileUpload.value = '';
 cameraCapture.value = '';
}

// Handle file selection from upload or camera
function handleFileSelection(event) {
 const files = Array.from(event.target.files);
 selectedFiles = [...selectedFiles, ...files];

 // Clear the other input
 if (event.target === fileUpload) {
 cameraCapture.value = '';
 } else {
 fileUpload.value = '';
 }

 displayFilePreview();
}

// Display preview of selected files
function displayFilePreview() {
 if (selectedFiles.length === 0) {
 filePreview.classList.add('hidden');
 return;
 }

 filePreview.classList.remove('hidden');
 previewList.innerHTML = '';

 selectedFiles.forEach((file, index) => {
 const fileItem = document.createElement('div');
 fileItem.className = 'flex items-center justify-between p-2 bg-gray-100 rounded-lg';

 const fileInfo = document.createElement('div');
 fileInfo.className = 'flex items-center gap-2';

 const fileIcon = document.createElement('span');
 fileIcon.textContent = file.type.startsWith('image/') ? '🖼️' : '📄';

 const fileName = document.createElement('span');
 fileName.textContent = file.name;
 fileName.className = 'text-sm text-gray-700';

 const fileSize = document.createElement('span');
 fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;
 fileSize.className = 'text-xs text-gray-500';

 const removeButton = document.createElement('button');
 removeButton.textContent = '❌';
 removeButton.className = 'text-red-500 hover:text-red-700 text-sm';
 removeButton.onclick = () => removeFile(index);

 fileInfo.appendChild(fileIcon);
 fileInfo.appendChild(fileName);
 fileInfo.appendChild(fileSize);

 fileItem.appendChild(fileInfo);
 fileItem.appendChild(removeButton);

 previewList.appendChild(fileItem);
 });
}

// Remove a file from selection
function removeFile(index) {
 selectedFiles.splice(index, 1);
 displayFilePreview();
}

// Upload documents to patient record
async function uploadDocumentsToPatient() {
 if (!currentPatient) {
 showMessage('Please authenticate first.');
 return;
 }

 if (selectedFiles.length === 0) {
 showMessage('Please select at least one file to upload.');
 return;
 }

 if (!documentTitle.value.trim()) {
 showMessage('Please enter a document title.');
 return;
 }

 const patientId = currentPatient.idNumber;

 showMessage('Uploading documents...', 'success');
 uploadDocuments.disabled = true;
 uploadDocuments.textContent = 'Uploading...';

 try {
 const uploadedDocuments = [];

 // Upload each file to Firebase Storage
 for (const file of selectedFiles) {
 const fileUrl = await uploadFileToStorage(file, patientId);
 if (fileUrl) {
 uploadedDocuments.push({
 type: documentType.value,
 title: documentTitle.value,
 content: fileUrl,
 notes: documentNotes.value.trim(),
 uploadedAt: new Date().toISOString(),
 fileName: file.name,
 fileSize: file.size
 });
 }
 }

 // Add documents to patient record in Firestore
 if (uploadedDocuments.length > 0) {
 await addDocumentsToPatient(patientId, uploadedDocuments);
 showMessage(`Successfully uploaded ${uploadedDocuments.length} document(s)!`, 'success');

 // Refresh the patient records display
 const updatedPatient = await getPatientFromFirebase(patientId);
 if (updatedPatient) {
 currentPatient = updatedPatient; // Update current patient data
 renderRecords(updatedPatient);
 }

 closeScanModalHandler();
 }

 } catch (error) {
 console.error('Error uploading documents:', error);
 showMessage('Error uploading documents. Please try again.');
 } finally {
 uploadDocuments.disabled = false;
 uploadDocuments.textContent = 'Upload Documents';
 }
}

// Upload file to Firebase Storage
async function uploadFileToStorage(file, patientId) {
 try {
 if (window.storage) {
 // Generate unique filename
 const timestamp = Date.now();
 const fileName = `${patientId}/${timestamp}_${file.name}`;
 const storageRef = ref(window.storage, `patient-documents/${fileName}`);

 // Upload file
 await uploadBytes(storageRef, file);

 // Get download URL
 const downloadURL = await getDownloadURL(storageRef);
 return downloadURL;
 } else {
 // Fallback: create object URL for demo
 return URL.createObjectURL(file);
 }
 } catch (error) {
 console.error('Error uploading file:', error);
 return null;
 }
}

// Add documents to patient record in Firestore
async function addDocumentsToPatient(patientId, documents) {
 try {
 if (window.db) {
 const patientRef = doc(window.db, 'patients', patientId);
 await updateDoc(patientRef, {
 folder: arrayUnion(...documents)
 });
 } else {
 // Fallback: update sample data
 if (samplePatientData[patientId]) {
 samplePatientData[patientId].folder.push(...documents);
 }
 }
 } catch (error) {
 console.error('Error adding documents to patient:', error);
 throw error;
 }
}


// Display patient's medical records
function renderRecords(patient) {
 recordsDisplay.innerHTML = ''; // Clear previous content

 // Create patient information header
 const header = document.createElement('div');
 header.className = 'bg-blue-100 text-blue-800 p-4 rounded-lg shadow-sm mb-4';
 header.innerHTML = `
 <h2 class="text-2xl font-semibold">${patient.name}</h2>
 <p class="text-sm">ID Number: ${patient.idNumber || 'N/A'}</p>
 <p class="text-sm">Date of Birth: ${patient.dob}</p>
 <p class="text-sm">Phone: ${patient.phone}</p>
 `;
 recordsDisplay.appendChild(header);

 // Check if patient has any records
 if (patient.folder.length === 0) {
 const noRecords = document.createElement('p');
 noRecords.className = 'text-gray-500 text-center py-8';
 noRecords.textContent = 'No records found for this patient.';
 recordsDisplay.appendChild(noRecords);
 return;
 }

 // Display each medical record
 patient.folder.forEach((item, index) => {
 const card = document.createElement('div');
 card.className = 'bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 last:mb-0';

 // Add record header with title and type
 const header = document.createElement('div');
 header.className = 'flex justify-between items-start mb-2';

 const title = document.createElement('h3');
 title.className = 'text-lg font-bold text-gray-700';
 title.textContent = item.title;

 const typeBadge = document.createElement('span');
 typeBadge.className = 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800';
 typeBadge.textContent = item.type.toUpperCase();

 header.appendChild(title);
 header.appendChild(typeBadge);
 card.appendChild(header);

 // Add upload date if available
 if (item.uploadedAt) {
 const uploadDate = document.createElement('p');
 uploadDate.className = 'text-xs text-gray-500 mb-2';
 uploadDate.textContent = `Uploaded: ${new Date(item.uploadedAt).toLocaleDateString()}`;
 card.appendChild(uploadDate);
 }

 // Add notes if available
 if (item.notes) {
 const notes = document.createElement('p');
 notes.className = 'text-sm text-gray-600 mb-2 italic';
 notes.textContent = `Notes: ${item.notes}`;
 card.appendChild(notes);
 }

 // Add record content based on type
 if (item.type === 'document' || item.type === 'prescription' || item.type === 'lab-result' || item.type === 'other') {
 if (item.content.startsWith('http') || item.content.startsWith('blob:')) {
 // It's a file URL - show download link
 const downloadLink = document.createElement('a');
 downloadLink.href = item.content;
 downloadLink.target = '_blank';
 downloadLink.className = 'inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline';
 downloadLink.innerHTML = `
 <span>📄</span>
 <span>View Document</span>
 ${item.fileName ? `<span class="text-sm text-gray-500">(${item.fileName})</span>` : ''}
 `;
 card.appendChild(downloadLink);
 } else {
 // It's text content
 const content = document.createElement('p');
 content.className = 'text-gray-600 text-sm leading-relaxed';
 content.textContent = item.content;
 card.appendChild(content);
 }
 } else if (item.type === 'image' || item.type === 'x-ray') {
 const imageContainer = document.createElement('div');
 imageContainer.className = 'mt-2';

 const image = document.createElement('img');
 image.src = item.content;
 image.alt = item.title;
 image.className = 'rounded-lg w-full max-w-sm mx-auto cursor-pointer hover:opacity-80 transition duration-300';
 image.onclick = () => window.open(item.content, '_blank');

 const imageLabel = document.createElement('p');
 imageLabel.className = 'text-center text-sm text-gray-500 mt-1';
 imageLabel.textContent = 'Click to view full size';

 imageContainer.appendChild(image);
 imageContainer.appendChild(imageLabel);
 card.appendChild(imageContainer);
 }

 recordsDisplay.appendChild(card);
 });
}