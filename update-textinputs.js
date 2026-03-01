const fs = require('fs');
const path = require('path');

const files = [
  'app/signup.tsx',
  'app/request-location.tsx',
  'app/request-details.tsx',
  'app/rate-experience.tsx',
  'app/payment.tsx',
  'app/payment-methods.tsx',
  'app/my-requests.tsx',
  'app/login.tsx',
  'app/edit-profile.tsx',
  'app/client-home.tsx',
  'app/chat.tsx',
  'app/change-password.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/inbox.tsx',
  'app/(tabs)/bookings.tsx'
];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/<TextInput/g, "<TextInput autoComplete='off' autoCorrect={false} spellCheck={false}");
    fs.writeFileSync(p, content);
    console.log('Updated ' + f);
  } else {
    console.log('Not found: ' + p);
  }
});
