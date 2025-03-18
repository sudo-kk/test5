const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://test5-production-8010.up.railway.app'  // Replace with your actual Railway URL
    : 'http://localhost:5000'
};

export default config;
