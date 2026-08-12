const COLUMNS = [
    {label: 'ID', key: 'id'},
    {label: 'Content', key: 'data'},
    {label: 'Author', key: 'userID'},
    {label: 'Post', key: 'postID'},
]

async function loadComments() {
    try {
        renderTable(await api('/comments'), COLUMNS)
    } catch (err) {
        showStatus(err.message)
    }
}

onSubmit('#createCommentForm', async (form) => {
    await api('/comments', {
        method: 'POST',
        body: JSON.stringify({
            data: form.data.value,
            postID: form.postID.value,
        })
    })
    form.reset()
    showStatus('Comment created.', 'success')
    await loadComments()
})

onSubmit('#editCommentForm', async (form) => {
    await api(`/comments/${form.commentId.value}`, {
        method: 'PUT',
        body: JSON.stringify({data: form.data.value})
    })
    form.reset()
    showStatus('Comment updated.', 'success')
    await loadComments()
})

onSubmit('#deleteCommentForm', async (form) => {
    await api(`/comments/${form.commentId.value}`, {method: 'DELETE'})
    form.reset()
    showStatus('Comment deleted.', 'success')
    await loadComments()
})

window.addEventListener('DOMContentLoaded', loadComments)
