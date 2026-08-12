const API_URL = '/api';
const AUTH_URL = `${window.location.protocol}//${window.location.hostname}:9000`;

function getToken() {
    const cookie = document.cookie
        .split('; ')
        .find(el => el.startsWith('token='))

    return cookie ? cookie.slice('token='.length) : ''
}

function setToken(token) {
    document.cookie = `token=${token};path=/;SameSite=Lax`
}

function clearToken() {
    document.cookie = "token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    }
}

async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {...options, headers: authHeaders()})
    const body = await res.json().catch(() => ({}))

    if (!res.ok || body.msg)
        throw new Error(body.msg || `request failed (${res.status})`)

    return body
}

function showStatus(msg, variant = 'danger') {
    const statusContainer = document.querySelector('#status')
    if (!statusContainer) return

    statusContainer.innerHTML = ''
    if (!msg) return

    const alert = document.createElement('div')
    alert.className = `alert alert-${variant} py-2`
    alert.setAttribute('role', 'alert')
    alert.textContent = msg
    statusContainer.appendChild(alert)
}

function isHttpUrl(value) {
    try {
        return ['http:', 'https:'].includes(new URL(String(value)).protocol)
    } catch {
        return false
    }
}

function fillCell(cell, value, col) {
    if (value === null || value === undefined || value === '') {
        cell.textContent = '—'
        return
    }

    if (col.type !== 'image' || !isHttpUrl(value)) {
        cell.textContent = String(value)
        return
    }

    const link = document.createElement('a')
    link.href = String(value)
    link.target = '_blank'
    link.rel = 'noreferrer'

    const img = document.createElement('img')
    img.src = String(value)
    img.alt = col.label
    img.loading = 'lazy'
    img.className = 'rounded object-fit-cover'
    img.style.width = '64px'
    img.style.height = '64px'
    img.addEventListener('error', () => {
        link.textContent = String(value)
        link.classList.add('text-break')
    })

    link.appendChild(img)
    cell.appendChild(link)
}

function renderTable(rows, columns) {
    const content = document.querySelector('#content')
    content.innerHTML = ''

    if (!rows.length) {
        const empty = document.createElement('p')
        empty.className = 'text-secondary fst-italic'
        empty.textContent = 'Nothing here yet.'
        content.appendChild(empty)
        return
    }

    const table = document.createElement('table')
    table.className = 'table table-sm table-striped align-middle'

    const headRow = table.createTHead().insertRow()
    for (const col of columns) {
        const th = document.createElement('th')
        th.scope = 'col'
        th.textContent = col.label
        headRow.appendChild(th)
    }

    const tbody = table.createTBody()
    for (const row of rows) {
        const tr = tbody.insertRow()
        for (const col of columns) {
            fillCell(tr.insertCell(), row[col.key], col)
        }
    }

    const scroller = document.createElement('div')
    scroller.className = 'table-responsive'
    scroller.appendChild(table)
    content.appendChild(scroller)
}

function onSubmit(formId, handler) {
    const form = document.querySelector(formId)
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        showStatus('')
        try {
            await handler(form)
        } catch (err) {
            showStatus(err.message)
        }
    })
}

function renderNav() {
    const nav = document.querySelector('#nav')
    if (!nav) return

    const links = [
        {href: 'index.html', label: 'Home'},
        {href: 'post.html', label: 'Posts'},
        {href: 'story.html', label: 'Stories'},
        {href: 'comment.html', label: 'Comments'},
        {href: 'user.html', label: 'Users'},
    ]
    const here = window.location.pathname.split('/').pop() || 'index.html'

    const wrapper = document.createElement('div')
    wrapper.className = 'container d-flex flex-wrap align-items-center gap-2'

    const brand = document.createElement('a')
    brand.className = 'navbar-brand'
    brand.href = 'index.html'
    brand.textContent = 'Social network'
    wrapper.appendChild(brand)

    const list = document.createElement('ul')
    list.className = 'navbar-nav flex-row flex-wrap gap-3 me-auto'
    for (const link of links) {
        const li = document.createElement('li')
        li.className = 'nav-item'
        const a = document.createElement('a')
        a.className = link.href === here ? 'nav-link active' : 'nav-link'
        if (link.href === here) a.setAttribute('aria-current', 'page')
        a.href = link.href
        a.textContent = link.label
        li.appendChild(a)
        list.appendChild(li)
    }
    wrapper.appendChild(list)

    const logout = document.createElement('button')
    logout.className = 'btn btn-outline-light btn-sm'
    logout.id = 'logoutButton'
    logout.type = 'button'
    logout.textContent = 'Log out'
    logout.addEventListener('click', () => {
        clearToken()
        window.location.href = '/login.html'
    })
    wrapper.appendChild(logout)

    nav.innerHTML = ''
    nav.appendChild(wrapper)
}

window.addEventListener('DOMContentLoaded', renderNav)
