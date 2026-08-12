const COLUMNS = [
    {label: 'Username', key: 'username'},
    {label: 'Bio', key: 'bio'},
    {label: 'Profile picture', key: 'profilePicture', type: 'image'},
    {label: 'Admin', key: 'admin'},
]

async function loadUsers() {
    try {
        renderTable(await api('/users'), COLUMNS)
    } catch (err) {
        showStatus(err.message)
    }
}

onSubmit('#editUserForm', async (form) => {
    await api(`/users/${localStorage.getItem('user')}`, {
        method: 'PUT',
        body: JSON.stringify({
            bio: form.bio.value,
            profilePicture: form.profilePicture.value,
        })
    })
    form.reset()
    showStatus('Profile updated.', 'success')
    await loadUsers()
})

onSubmit('#deleteUserForm', async (form) => {
    await api(`/users/${form.username.value}`, {method: 'DELETE'})
    form.reset()
    showStatus('User deleted.', 'success')
    await loadUsers()
})

window.addEventListener('DOMContentLoaded', loadUsers)
