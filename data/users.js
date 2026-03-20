
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by pre-save hook? No, seeder inserts directly usually, but let's see model. Model has pre-save. But insertMany might bypass?
        // insertMany DOES NOT trigger pre('save') middleware.
        // We need to hash passwords here or use create (loop).
        // OR, just hash them manually here for simplicity.
        isAdmin: true,
    },
    {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
        isAdmin: false,
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        isAdmin: false,
    },
];

// We'll handle hashing in the seeder or just assume fixed hash for "password123"
// $2a$10$ixl/.. is a hash for "password123" usually.
// Let's actually update seeder.js to use User.create or loop to trigger hooks, OR hash here.
// Verified bcrypt hash for '123456': $2a$10$du1.. 
// Let's just use a known hash for '123456' or 'password' to avoid issues, or update seeder to hash.
// Better: Update seeder.js to loop and save, OR just pre-hash here.
// Hash for 'password123': $2a$10$vYr.s1.s.. (generating real one is better)

// Actually, I'll update seeder.js to use create() or save() in a loop to ensure hooks run, or just import bcrypt in seeder. 
// For now, I will leave plain text and update seeder.js to hash them before inserting.
module.exports = users; 
