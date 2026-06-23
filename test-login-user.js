import { getPayload } from 'payload'
import config from './payload.config'

async function run() {
  console.log("Initializing Payload...");
  const payload = await getPayload({ config })
  
  console.log("Attempting to log in user...");
  try {
    const result = await payload.login({
      collection: 'users',
      data: {
        email: 'juniorpvh10@gmail.com',
        password: 'Macario90346189',
      },
    })
    console.log('Login result:', result)
  } catch (error) {
    console.error('Error logging in user:', error)
    if (error && typeof error === 'object' && 'errors' in error) {
      console.error('Detailed validation errors:', JSON.stringify(error.errors, null, 2))
    }
  }
  process.exit(0)
}

run()
