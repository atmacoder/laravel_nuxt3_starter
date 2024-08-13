import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  persist:true,
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
  actions: {
    async initCsrfToken() {
      const { public: { apiBase } } = useRuntimeConfig()
      try {
        await fetch(`${apiBase}/sanctum/csrf-cookie`, {
          method: 'GET',
          credentials: 'include' // Important for sending cookies
        })
        console.log('CSRF-токен установлен!')
      } catch (error) {
        console.error('Ошибка при установке CSRF-токена:', error)
      }
    },

    async login(credentials) {
      const { public: { apiBase } } = useRuntimeConfig()
      try {
        const response = await fetch(`${apiBase}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Неверный логин или пароль')
          } else {
            throw new Error(`Ошибка входа: ${response.status}`)
          }
        }

        const data = await response.json()
        this.user = data.user
        this.token = data.token

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data

        // Fetch user data after successful login
        await this.fetchUser()
        return true
      } catch (error) {
        console.error('Ошибка входа:', error)
        return false
      }
    },

    async register(credentials) {
      const { public: { apiBase } } = useRuntimeConfig()
      try {
        const response = await fetch(`${apiBase}/api/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        })

        if (!response.ok) {
          if (response.status === 422) {
            const errorData = await response.json()
            throw new Error(JSON.stringify(errorData.errors)) 
          } else {
            throw new Error(`Ошибка регистрации: ${response.status}`)
          }
        }

        const data = await response.json()
        this.user = data.user
        this.token = data.token

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data

        // Fetch user data after successful registration
        await this.fetchUser()
        return true
      } catch (error) {
        if (error.message && error.message.startsWith('{')) {
          throw error 
        } else {
          // Handle other errors (e.g., server errors)
          console.error('Ошибка регистрации:', error)
          return false
        }
      }
    },

    async logout() {
      const { public: { apiBase } } = useRuntimeConfig()
      try {
        const response = await fetch(`${apiBase}/api/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`Ошибка выхода: ${response.status}`)
        }

        this.user = null
        this.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('user'); // Clear user data

      } catch (error) {
        console.error('Ошибка выхода:', error)
      }
    },

    async fetchUser() {
      const { public: { apiBase } } = useRuntimeConfig()
      try {
        const response = await fetch(`${apiBase}/api/user`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`Ошибка получения пользователя: ${response.status}`)
        }

        this.user = await response.json()
      } catch (error) {
        console.error('Ошибка получения пользователя:', error)
      }
    },

    // Load user data from local storage on store creation
    async loadUserFromLocalStorage() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    },
  },

  // Call loadUserFromLocalStorage after state initialization
  created() {
    this.loadUserFromLocalStorage();
  },
});