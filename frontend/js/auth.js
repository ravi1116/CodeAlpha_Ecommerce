document.addEventListener('DOMContentLoaded', function() {
  const API_BASE_URL = 'http://localhost:5000/api';
  const HOME_PAGE = 'index.html';

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

        const formData = {
          username: document.getElementById('reg-username').value.trim(),
          email: document.getElementById('reg-email').value.trim(),
          password: document.getElementById('reg-password').value.trim()
        };

        if (!formData.username || !formData.email || !formData.password) {
          throw new Error('Please fill all fields');
        }

        const response = await fetch(`${API_BASE_URL}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        localStorage.setItem('userInfo', JSON.stringify(data));
        window.location.href = HOME_PAGE;
      } catch (error) {
        alert(error.message);
        console.error('Registration error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        const formData = {
          email: document.getElementById('login-email').value.trim(),
          password: document.getElementById('login-password').value.trim()
        };

        if (!formData.email || !formData.password) {
          throw new Error('Please fill all fields');
        }

        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('userInfo', JSON.stringify(data));
        window.location.href = HOME_PAGE;
      } catch (error) {
        alert(error.message);
        console.error('Login error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    });
  }
});