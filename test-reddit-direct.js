// Test Reddit authorization URL generation directly
console.log('Testing Reddit authorization URL generation...');

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDIRECT_URI = 'https://your-replit-domain.replit.dev/api/reddit/callback';
const STATE = 'test123';

if (!CLIENT_ID) {
  console.error('REDDIT_CLIENT_ID not found');
  process.exit(1);
}

const params = new URLSearchParams({
  client_id: CLIENT_ID,
  response_type: 'code',
  state: STATE,
  redirect_uri: REDIRECT_URI,
  duration: 'permanent',
  scope: 'read'
});

const authUrl = `https://www.reddit.com/api/v1/authorize?${params.toString()}`;

console.log('Generated Reddit Authorization URL:');
console.log(authUrl);
console.log('\nClient ID:', CLIENT_ID);
console.log('Redirect URI:', REDIRECT_URI);
console.log('State:', STATE);

// Test with current domain
const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
if (replitDomain) {
  const replitRedirectUri = `https://${replitDomain}/api/reddit/callback`;
  const replitParams = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    state: STATE,
    redirect_uri: replitRedirectUri,
    duration: 'permanent',
    scope: 'read'
  });
  
  const replitAuthUrl = `https://www.reddit.com/api/v1/authorize?${replitParams.toString()}`;
  console.log('\nReplit Domain Authorization URL:');
  console.log(replitAuthUrl);
  console.log('Replit Domain:', replitDomain);
}