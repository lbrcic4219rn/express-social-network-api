onSubmit('#registerForm', async (form) => {
    const username = form.username.value

    if (form.password.value !== form.password2.value)
        throw new Error('passwords do not match')

    const res = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password: form.password.value})
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.token)
        throw new Error(data.msg || 'could not register')

    localStorage.setItem('user', username)
    setToken(data.token)
    window.location.href = '/index.html'
})
