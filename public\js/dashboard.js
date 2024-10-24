document.addEventListener('DOMContentLoaded', () => {
    // Dashboard functionality
    console.log('Dashboard loaded');
    
    // Example: Add event listeners for dashboard interactions
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', () => {
            // Handle user info click
        });
    }

    const announcementForm = document.getElementById('announcementForm');
    const announcementsList = document.getElementById('announcementsList');
    
    // Load existing announcements
    loadAnnouncements();

    // Handle form submission
    announcementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;
        
        try {
            const response = await fetch('/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    date: new Date().toISOString()
                })
            });

            if (response.ok) {
                // Clear form
                announcementForm.reset();
                // Reload announcements
                loadAnnouncements();
            } else {
                console.error('Failed to create announcement');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Load announcements function
    async function loadAnnouncements() {
        try {
            const response = await fetch('/api/announcements');
            const announcements = await response.json();
            
            announcementsList.innerHTML = announcements.length > 0 
                ? announcements.map(announcement => `
                    <div class="announcement-item" data-id="${announcement._id}">
                        <h3>${announcement.title}</h3>
                        <p>${announcement.content}</p>
                        <small>Posted on: ${new Date(announcement.date).toLocaleString()}</small>
                        <div class="announcement-actions">
                            <button class="edit-btn" onclick="editAnnouncement('${announcement._id}')">Edit</button>
                            <button class="delete-btn" onclick="deleteAnnouncement('${announcement._id}')">Delete</button>
                        </div>
                    </div>
                `).join('')
                : '<p>No announcements at this time.</p>';
        } catch (error) {
            console.error('Error loading announcements:', error);
        }
    }

    // Edit announcement function
    window.editAnnouncement = async (id) => {
        const announcement = document.querySelector(`[data-id="${id}"]`);
        const title = announcement.querySelector('h3').textContent;
        const content = announcement.querySelector('p').textContent;

        // Populate form with existing data
        document.getElementById('announcementTitle').value = title;
        document.getElementById('announcementContent').value = content;

        // Change form submission to update
        announcementForm.onsubmit = async (e) => {
            e.preventDefault();
            
            try {
                const response = await fetch(`/api/announcements/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: document.getElementById('announcementTitle').value,
                        content: document.getElementById('announcementContent').value,
                    })
                });

                if (response.ok) {
                    announcementForm.reset();
                    loadAnnouncements();
                    // Reset form submission to create
                    announcementForm.onsubmit = null;
                }
            } catch (error) {
                console.error('Error updating announcement:', error);
            }
        };
    };

    // Delete announcement function
    window.deleteAnnouncement = async (id) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            try {
                const response = await fetch(`/api/announcements/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadAnnouncements();
                }
            } catch (error) {
                console.error('Error deleting announcement:', error);
            }
        }
    };
});
