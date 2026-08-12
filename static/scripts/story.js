const COLUMNS = [
    {label: 'ID', key: 'id'},
    {label: 'Content', key: 'data', type: 'image'},
    {label: 'Author', key: 'userID'},
]

async function loadStories() {
    try {
        renderTable(await api('/stories'), COLUMNS)
    } catch (err) {
        showStatus(err.message)
    }
}

onSubmit('#createStoryForm', async (form) => {
    await api('/stories', {
        method: 'POST',
        body: JSON.stringify({data: form.data.value})
    })
    form.reset()
    showStatus('Story created.', 'success')
    await loadStories()
})

onSubmit('#editStoryForm', async (form) => {
    await api(`/stories/${form.storyId.value}`, {
        method: 'PUT',
        body: JSON.stringify({data: form.data.value})
    })
    form.reset()
    showStatus('Story updated.', 'success')
    await loadStories()
})

onSubmit('#deleteStoryForm', async (form) => {
    await api(`/stories/${form.storyId.value}`, {method: 'DELETE'})
    form.reset()
    showStatus('Story deleted.', 'success')
    await loadStories()
})

window.addEventListener('DOMContentLoaded', loadStories)
