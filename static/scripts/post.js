const COLUMNS = [
    {label: 'ID', key: 'id'},
    {label: 'Description', key: 'data'},
    {label: 'Author', key: 'userID'},
    {label: 'Image', key: 'image', type: 'image'},
    {label: 'Likes', key: 'likeCount'},
]

async function loadPosts() {
    try {
        renderTable(await api('/posts'), COLUMNS)
    } catch (err) {
        showStatus(err.message)
    }
}

onSubmit('#createPostForm', async (form) => {
    await api('/posts', {
        method: 'POST',
        body: JSON.stringify({
            data: form.data.value,
            image: form.image.value,
            tags: form.tags.value.split(' ').filter(Boolean),
        })
    })
    form.reset()
    showStatus('Post created.', 'success')
    await loadPosts()
})

onSubmit('#editPostForm', async (form) => {
    await api(`/posts/${form.postId.value}`, {
        method: 'PUT',
        body: JSON.stringify({
            data: form.data.value,
            image: form.image.value,
            tags: form.tags.value.split(' ').filter(Boolean),
        })
    })
    form.reset()
    showStatus('Post updated.', 'success')
    await loadPosts()
})

onSubmit('#deletePostForm', async (form) => {
    await api(`/posts/${form.postId.value}`, {method: 'DELETE'})
    form.reset()
    showStatus('Post deleted.', 'success')
    await loadPosts()
})

window.addEventListener('DOMContentLoaded', loadPosts)
