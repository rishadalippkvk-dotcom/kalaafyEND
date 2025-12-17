const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure Multer Storage
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const app = express();
// Use Render's PORT environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from the frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const DATA_DIR = path.join(__dirname, 'data');
const PROGRAMS_FILE = path.join(DATA_DIR, 'programs.json');
const NOTICES_FILE = path.join(DATA_DIR, 'notices.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const SCOREBOARD_FILE = path.join(DATA_DIR, 'scoreboard.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

// Helper to read data
const readData = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

// Helper to write data
const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Login Endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admins = readData(ADMINS_FILE);
    // Debug logging
    console.log('Login attempt:', {
        receivedUsername: username,
        receivedPassword: password,
        adminsFound: admins.length
    });

    const admin = admins.find(a => a.username === username && a.password === password);
    console.log('Admin found:', !!admin);

    if (admin) {
        res.json({ success: true, token: 'admin-token-123' });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials',
            debug: {
                receivedUsername: username,
                receivedPassword: password,
                adminsCount: admins.length,
                adminFile: ADMINS_FILE
            }
        });
    }
});

// --- Programs CRUD ---

app.get('/api/programs', (req, res) => {
    const programs = readData(PROGRAMS_FILE);
    res.json(programs);
});

app.post('/api/programs', (req, res) => {
    const programs = readData(PROGRAMS_FILE);
    const newProgram = { id: Date.now(), ...req.body };
    programs.push(newProgram);
    writeData(PROGRAMS_FILE, programs);
    res.json(newProgram);
});

app.put('/api/programs/:id', (req, res) => {
    const { id } = req.params;
    let programs = readData(PROGRAMS_FILE);
    const index = programs.findIndex(p => p.id == id);
    if (index !== -1) {
        programs[index] = { ...programs[index], ...req.body };
        writeData(PROGRAMS_FILE, programs);
        res.json(programs[index]);
    } else {
        res.status(404).json({ message: 'Program not found' });
    }
});

app.delete('/api/programs/:id', (req, res) => {
    const { id } = req.params;
    let programs = readData(PROGRAMS_FILE);
    programs = programs.filter(p => p.id != id);
    writeData(PROGRAMS_FILE, programs);
    res.json({ success: true });
});

// --- Notices CRUD ---

app.get('/api/notices', (req, res) => {
    const notices = readData(NOTICES_FILE);
    res.json(notices);
});

app.post('/api/notices', (req, res) => {
    const notices = readData(NOTICES_FILE);
    const newNotice = { id: Date.now(), ...req.body };
    notices.push(newNotice);
    writeData(NOTICES_FILE, notices);
    res.json(newNotice);
});

app.put('/api/notices/:id', (req, res) => {
    const { id } = req.params;
    let notices = readData(NOTICES_FILE);
    const index = notices.findIndex(n => n.id == id);
    if (index !== -1) {
        notices[index] = { ...notices[index], ...req.body };
        writeData(NOTICES_FILE, notices);
        res.json(notices[index]);
    } else {
        res.status(404).json({ message: 'Notice not found' });
    }
});

app.delete('/api/notices/:id', (req, res) => {
    const { id } = req.params;
    let notices = readData(NOTICES_FILE);
    notices = notices.filter(n => n.id != id);
    writeData(NOTICES_FILE, notices);
    res.json({ success: true });
});

// --- Scoreboard CRUD ---

app.get('/api/scoreboard', (req, res) => {
    const scores = readData(SCOREBOARD_FILE);
    res.json(scores);
});

app.post('/api/scoreboard', (req, res) => {
    const scores = readData(SCOREBOARD_FILE);
    const newScore = { id: Date.now(), ...req.body };
    scores.push(newScore);
    writeData(SCOREBOARD_FILE, scores);
    res.json(newScore);
});

app.put('/api/scoreboard/:id', (req, res) => {
    const { id } = req.params;
    let scores = readData(SCOREBOARD_FILE);
    const index = scores.findIndex(s => s.id == id);
    if (index !== -1) {
        scores[index] = { ...scores[index], ...req.body };
        writeData(SCOREBOARD_FILE, scores);
        res.json(scores[index]);
    } else {
        res.status(404).json({ message: 'Score entry not found' });
    }
});

app.delete('/api/scoreboard/:id', (req, res) => {
    const { id } = req.params;
    let scores = readData(SCOREBOARD_FILE);
    scores = scores.filter(s => s.id != id);
    writeData(SCOREBOARD_FILE, scores);
    res.json({ success: true });
});

// --- Gallery CRUD ---

// --- Gallery CRUD ---

app.get('/api/gallery', (req, res) => {
    const images = readData(GALLERY_FILE);
    res.json(images);
});

app.post('/api/gallery', upload.single('image'), (req, res) => {
    console.log("Received request:", req.body);

    const images = readData(GALLERY_FILE);


    let imageUrl = req.body.url;
    if (req.file) {
        console.log("File uploaded:", req.file);
        // Updated to work with Render's dynamic URL
        const host = req.get('host');
        imageUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
    }

    console.log("Image URL:", imageUrl);

    const newImage = {
        id: Date.now(),
        ...req.body,
        url: imageUrl
    };

    images.push(newImage);
    writeData(GALLERY_FILE, images);
    res.json(newImage);
});

app.put('/api/gallery/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    let images = readData(GALLERY_FILE);
    const index = images.findIndex(img => img.id == id);

    if (index !== -1) {
        let imageUrl = req.body.url || images[index].url;
        if (req.file) {
            // Updated to work with Render's dynamic URL
            const host = req.get('host');
            imageUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
        }

        images[index] = {
            ...images[index],
            ...req.body,
            url: imageUrl
        };

        writeData(GALLERY_FILE, images);
        res.json(images[index]);
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

app.delete('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    let images = readData(GALLERY_FILE);
    images = images.filter(img => img.id != id);
    writeData(GALLERY_FILE, images);
    res.json({ success: true });
});

// Updated to use the PORT variable for Render deployment
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});