
// const fetch = require('node-fetch');
// Actually node 18+ has global fetch.

async function test() {
    try {
        const response = await fetch('https://backend.shaikrasheed634.workers.dev/api/v1/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@itpartner.com',
                password: 'admin@9912'
            })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
