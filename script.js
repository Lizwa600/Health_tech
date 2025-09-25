// Simulated database for the prototype.
// In a real application, this data would be fetched from a secure,
// centralized database like Firestore or a hospital's EMR system.
const patientData = {
    'P101': {
        name: 'Alice Johnson',
        dob: '1995-07-20',
        folder: [
            { type: 'document', title: 'Consultation Report - 2023-10-15', content: 'Patient presented with a persistent cough and fatigue. Prescribed antibiotics and advised rest.' },
            { type: 'document', title: 'Lab Results - 2023-09-28', content: 'Blood tests show normal white blood cell count. Cholesterol levels are slightly elevated.' },
            { type: 'image', title: 'Chest X-ray Scan - 2023-10-14', content: 'https://placehold.co/400x300/e2e8f0/000000?text=Chest+X-ray' },
            { type: 'document', title: 'Allergy Information', content: 'Patient has a known allergy to penicillin.' },
            { type: 'document', title: 'Prescription - 2023-11-05', content: 'Medication: Paracetamol, 500mg. Dosage: One tablet every 6 hours as needed for pain.' }
        ]
    },
    'P102': {
        name: 'Bob Williams',
        dob: '1988-03-12',
        folder: [
            { type: 'document', title: 'Physical Examination Report - 2024-01-20', content: 'Routine check-up. Patient is in good health with no major concerns. Advised to maintain a healthy diet and regular exercise.' },
            { type: 'document', title: 'Vaccination History', content: 'Received annual flu shot on 2023-11-01. All childhood immunizations are up-to-date.' }
        ]
    },
    'P103': {
        name: 'Charlie Davis',
        dob: '1975-01-25',
        folder: [
            { type: 'document', title: 'Cardiology Report - 2023-06-10', content: 'Patient reports occasional palpitations. ECG results are stable. Recommended follow-up in 6 months.' }
        ]
    }
};

const searchButton = document.getElementById('search-button');
const patientIdInput = document.getElementById('patient-id-input');
const recordsDisplay = document.getElementById('records-display');
const messageArea = document.getElementById('message-area');
const recordsContainer = document.getElementById('records-container');

// Function to render the patient's records
function renderRecords(patient) {
    recordsDisplay.innerHTML = ''; // Clear previous content

    // Create a header for the patient's information
    const header = document.createElement('div');
    header.className = 'bg-blue-100 text-blue-800 p-4 rounded-lg shadow-sm mb-4';
    header.innerHTML = `
        <h2 class="text-2xl font-semibold">${patient.name}</h2>
        <p class="text-sm">Date of Birth: ${patient.dob}</p>
    `;
    recordsDisplay.appendChild(header);

    if (patient.folder.length === 0) {
        const noRecords = document.createElement('p');
        noRecords.className = 'text-gray-500 text-center py-8';
        noRecords.textContent = 'No records found for this patient.';
        recordsDisplay.appendChild(noRecords);
    }

    // Loop through the patient's folder and create a card for each item
    patient.folder.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 last:mb-0';

        const title = document.createElement('h3');
        title.className = 'text-lg font-bold text-gray-700 mb-2';
        title.textContent = item.title;

        card.appendChild(title);

        if (item.type === 'document') {
            const content = document.createElement('p');
            content.className = 'text-gray-600 text-sm leading-relaxed';
            content.textContent = item.content;
            card.appendChild(content);
        } else if (item.type === 'image') {
            const image = document.createElement('img');
            image.src = item.content;
            image.alt = item.title;
            image.className = 'mt-2 rounded-lg w-full max-w-sm mx-auto';
            card.appendChild(image);
        }
        recordsDisplay.appendChild(card);
    });

    // Show the records container
    recordsContainer.classList.remove('hidden');
}

// Event listener for the search button click
searchButton.addEventListener('click', () => {
    const patientId = patientIdInput.value.trim().toUpperCase();
    messageArea.textContent = ''; // Clear any previous messages
    recordsContainer.classList.add('hidden'); // Hide the records

    // Simple validation
    if (!patientId) {
        messageArea.textContent = 'Please enter a Patient ID.';
        return;
    }

    // Look up the patient in the simulated database
    const patient = patientData[patientId];

    if (patient) {
        renderRecords(patient);
    } else {
        messageArea.textContent = 'Patient ID not found. Please try again.';
    }
});