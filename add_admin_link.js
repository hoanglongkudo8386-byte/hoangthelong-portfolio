const fs = require('fs');
const path = require('path');

const dirs = [
    'C:\\Users\\DELL\\Documents\\web cá nhân',
    'C:\\Users\\DELL\\Documents\\hoangthelong-portfolio'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'admin.html' && !f.includes('CU.html') && !f.includes('rev_'));
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find the copyright year and wrap it in a hidden link
        // Current: <p class="footer-text">&copy; 2026
        // New: <p class="footer-text">&copy; <a href="admin.html" style="color: inherit; text-decoration: none;">2026</a>
        
        // Need to handle different encoding characters for copyright symbol that might exist
        const regex1 = /(&copy;|©)\s*2026/;
        if (regex1.test(content) && !content.includes('href="admin.html" style="color: inherit')) {
            content = content.replace(regex1, '$1 <a href="admin.html" style="color: inherit; text-decoration: none;" title="">2026</a>');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated footer in ${filePath}`);
        } else {
            // Backup regex if year is different or symbol is weird
            const regex2 = /2026\s+Ho/;
            if (regex2.test(content) && !content.includes('href="admin.html" style="color: inherit')) {
                content = content.replace(regex2, '<a href="admin.html" style="color: inherit; text-decoration: none;" title="">2026</a> Ho');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated footer in ${filePath}`);
            }
        }
    });
});
