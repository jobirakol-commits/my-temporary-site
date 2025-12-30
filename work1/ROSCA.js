// --- Initial Setup and Utility Functions ---

const CONTRIBUTION_AMOUNT = 50000;
const PAYOUT_AMOUNT = 500000;

// Get or initialize members array from localStorage
let members = JSON.parse(localStorage.getItem('chamaMembers')) || [];
// Get the current week number (e.g., how many rounds have passed)
let currentWeek = parseInt(localStorage.getItem('currentWeek')) || 1;

/**
 * Utility to switch the visible page.
 * @param {string} pageId - The ID of the page element to display.
 */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// --- Member Registration and Login ---

document.getElementById('registration-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    // Check if member already exists
    if (members.find(m => m.email === email)) {
        alert('Registration failed: An account with this email already exists.');
        return;
    }

    const newMember = {
        id: members.length + 1,
        name: name,
        email: email,
        password: password, // In a real app, this should be a hashed password!
        receivedWeek: 0 // 0 means not yet received
    };

    members.push(newMember);
    localStorage.setItem('chamaMembers', JSON.stringify(members));
    alert('Registration successful! You are Member #' + newMember.id);
    this.reset();
    showPage('login-page');
});

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const member = members.find(m => m.email === email && m.password === password);

    if (member) {
        localStorage.setItem('loggedInMemberEmail', email);
        showPage('dashboard-page');
        loadDashboard(member.name);
    } else {
        alert('Login failed: Invalid email or password.');
    }
});

function logout() {
    localStorage.removeItem('loggedInMemberEmail');
    showPage('login-page');
    document.getElementById('login-form').reset();
}

// --- Dashboard Logic ---

/**
 * Determines the recipient for a given week number.
 * The system cycles through members by their ID.
 * @param {number} week The week number (1, 2, 3, ...)
 * @returns {object} The member object who is the recipient.
 */
function getRecipient(week) {
    if (members.length === 0) return { name: 'N/A' };

    // The recipient ID is determined by (week - 1) % number_of_members + 1
    const recipientId = ((week - 1) % members.length) + 1;
    return members.find(m => m.id === recipientId) || { name: 'Unknown' };
}

/**
 * Generates the full schedule and updates dashboard elements.
 * @param {string} memberName - The name of the logged-in member.
 */
function loadDashboard(memberName) {
    document.getElementById('welcome-message').textContent = `Welcome, ${memberName}`;
    document.getElementById('current-week').textContent = `Week ${currentWeek}`;

    const currentRecipient = getRecipient(currentWeek);
    document.getElementById('current-recipient').textContent = currentRecipient.name;

    const tableBody = document.querySelector('#schedule-table tbody');
    tableBody.innerHTML = ''; // Clear previous schedule

    // Calculate how many full cycles have been completed
    const numMembers = members.length;
    let maxWeeks = numMembers * 3; // Show 3 full cycles for a long-term view

    for (let week = 1; week <= maxWeeks; week++) {
        const recipient = getRecipient(week);
        let statusText = 'Pending';
        let statusClass = '';

        if (week <= currentWeek) {
            statusText = 'Received';
            statusClass = 'status-received';
        } else {
            statusText = 'Scheduled';
        }

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${week}</td>
            <td>${recipient.name} (Member ID: ${recipient.id})</td>
            <td class="${statusClass}">${statusText}</td>
        `;

        // Highlight the current week
        if (week === currentWeek) {
            row.style.backgroundColor = '#fff3cd'; // Light yellow for current
        }
    }
}

// --- Initialization ---

/**
 * Check on page load if a member is logged in and display the correct page.
 */
(function init() {
    // If there are less than 10 members, create some mock members for demonstration
    if (members.length < 10) {
        const mockNames = ["Alice K.", "Ben C.", "Chantal M.", "David O.", "Eve W.", "Faisal N.", "Grace R.", "Henry L.", "Irene B.", "Juma T."];
        members = mockNames.map((name, index) => ({
            id: index + 1,
            name: name,
            email: name.toLowerCase().replace(/\s/g, '') + '@jobil.com',
            password: 'password',
            receivedWeek: 0
        }));
        localStorage.setItem('chamaMembers', JSON.stringify(members));
        console.log(`Initialized ${members.length} mock members.`);
    }

    const loggedInEmail = localStorage.getItem('loggedInMemberEmail');
    if (loggedInEmail) {
        const member = members.find(m => m.email === loggedInEmail);
        if (member) {
            showPage('dashboard-page');
            loadDashboard(member.name);
            return;
        }
    }

    // Default to registration page
    showPage('registration-page');
})();

// --- Simulation Feature (Optional) ---

// *Optional: Function to simulate the passage of a week and update the schedule*
// Uncomment the line below to add a button to your dashboard for advancing the week.
// document.getElementById('dashboard-page').innerHTML += '<button onclick="advanceWeek()">Advance Week (Simulate)</button>';

function advanceWeek() {
    currentWeek++;
    localStorage.setItem('currentWeek', currentWeek);
    alert(`System advanced to Week ${currentWeek}. The new recipient is ${getRecipient(currentWeek).name}`);

    const loggedInEmail = localStorage.getItem('loggedInMemberEmail');
    const member = members.find(m => m.email === loggedInEmail);
    if (member) {
        loadDashboard(member.name);
    }
}