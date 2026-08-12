onSubmit('#loginForm', async (form) => {
    const username = form.username.value

    const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password: form.password.value})
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.token)
        throw new Error(data.msg || 'could not log in')

    localStorage.setItem('user', username)
    setToken(data.token)
    window.location.href = '/index.html'
})
