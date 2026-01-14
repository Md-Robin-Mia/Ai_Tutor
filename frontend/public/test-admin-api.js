// Test script to check admin dashboard API calls
console.log('=== Testing Admin Dashboard API Calls ===');

// Test if we can access the admin dashboard page
fetch('/api/admin/dashboard/stats', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTVlYjhiZWE5ODIwNzE1NTRiOTc2NGMiLCJpYXQiOjE3NjgxNjg1NzUsImV4cCI6MTc2ODc3MzM3NX0.vfc9AvB5jl6CUNMOpPfXqFbHblzvXkQhBgFn3Lpyy5s'
  }
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});
