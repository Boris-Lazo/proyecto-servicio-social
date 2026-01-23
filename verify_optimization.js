const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:4000/api';
const EMAIL = 'borisstanleylazocastillo@gmail.com';
const PASS = 'dev2024!';
const TEST_IMG = 'public/img/fondo-index.jpeg';

async function run() {
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: EMAIL, contrasena: PASS })
    });

    if (!loginRes.ok) {
        throw new Error('Login failed: ' + await loginRes.text());
    }
    const { token } = await loginRes.json();
    console.log('   Login successful.');

    console.log('2. Uploading image...');
    const buffer = fs.readFileSync(TEST_IMG);
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('titulo', 'Test Optimization Auto');
    formData.append('fecha', '2025-01-23');
    formData.append('fotos', blob, 'test-image.jpg');

    const uploadRes = await fetch(`${API_URL}/albums`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (!uploadRes.ok) {
        throw new Error('Upload failed: ' + await uploadRes.text());
    }

    const { album } = await uploadRes.json();
    console.log(`   Album created: ${album.id}`);

    console.log('3. Verifying files...');
    // Check API response for .webp extensions
    const photos = album.fotos;
    const allWebP = photos.every(p => p.endsWith('.webp'));
    if (!allWebP) {
        throw new Error('Verification FAILED: Some files are not .webp: ' + JSON.stringify(photos));
    }
    console.log('   API Response confirms .webp extension.');

    // Check physical file system
    // Path: private/upload/albums/<album_id>/<photo>
    // Note: album.id is often the directory name or ID. in ControlerAlbum it uses "fecha - slug".
    // Let's check the dir.
    const uploadDir = path.join('private', 'upload', 'albums', album.id);
    if (!fs.existsSync(uploadDir)) {
        throw new Error(`Directory not found: ${uploadDir}`);
    }

    const files = fs.readdirSync(uploadDir);
    const physicalWebP = files.every(f => f.endsWith('.webp'));
    if (!physicalWebP) {
        throw new Error('Verification FAILED: Physical files contain non-webp: ' + JSON.stringify(files));
    }
    console.log('   Physical files confirmed as .webp.');

    console.log('4. Cleaning up...');
    const deleteRes = await fetch(`${API_URL}/albums/${album.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (deleteRes.ok) {
        console.log('   Cleanup successful.');
    } else {
        console.error('   Cleanup failed:', await deleteRes.text());
    }

    console.log('SUCCESS: Image optimization verified.');
}

run().catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
});
