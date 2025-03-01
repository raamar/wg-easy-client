import readline from 'readline'
import { WgEasyClient } from './wgClient'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function prompt(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function handleError(error: any) {
  if (error.response) {
    console.error(`❌ Error: Server responded with status ${error.response.status}`)
    console.error(`📌 Message: ${error.response.data?.message || 'Unknown server error'}`)
  } else if (error.request) {
    console.error('❌ Error: No response received from the server. Check the URL and try again.')
  } else {
    console.error('❌ Unexpected error:', error.message)
  }
}

async function main() {
  console.log('=== WireGuard Easy Client CLI ===')
  const client = new WgEasyClient()

  console.log('\n🔑 Authenticating...')
  try {
    await client['authenticate']() // Force authentication at startup
    console.log('✅ Successfully authenticated!')
  } catch (error) {
    console.error('❌ Authentication failed. Please check your password.')
    rl.close()
    return
  }

  while (true) {
    console.log('\nAvailable actions:')
    console.log('1. Create a client')
    console.log('2. Delete a client')
    console.log('3. Enable a client')
    console.log('4. Disable a client')
    console.log('5. List clients')
    console.log('6. Get client ID by name')
    console.log('7. Get client IDs by subname')
    console.log('0. Exit')

    const choice = await prompt('Select an action (1-6): ')

    try {
      switch (choice) {
        case '1': {
          const name = await prompt('Enter client name: ')
          const result = await client.createClient(name)
          console.log(`✅ Success: ${result}`)
          break
        }
        case '2': {
          const clientId = await prompt('Enter client ID: ')
          const result = await client.deleteClient(clientId)
          console.log(`✅ Success: ${result}`)
          break
        }
        case '3': {
          const clientId = await prompt('Enter client ID: ')
          const result = await client.enableClient(clientId)
          console.log(`✅ Success: ${result}`)
          break
        }
        case '4': {
          const clientId = await prompt('Enter client ID: ')
          const result = await client.disableClient(clientId)
          console.log(`✅ Success: ${result}`)
          break
        }
        case '5': {
          const clients = await client.getClients()
          console.log('\n📜 Client List:')
          if (clients.length === 0) {
            console.log('No clients found.')
          } else {
            clients.forEach((c, i) =>
              console.log(`${i + 1}. ${c.name} (ID: ${c.id}) - ${c.enabled ? '✅ Active' : '❌ Disabled'}`)
            )
          }
          break
        }
        case '6': {
          const name = await prompt('Enter client name: ')
          const clientId = await client.getClientIdByName(name)
          if (clientId) {
            console.log(`✅ Client ID: ${clientId}`)
          } else {
            console.log('❌ Client not found.')
          }
          break
        }
        case '7': {
          const subname = await prompt('Enter client subname: ')
          const clientIds = await client.getCleintIdsBySubname(subname)
          if (clientIds?.length) {
            console.log(`✅ Client IDs`)
            console.dir(clientIds)
          } else {
            console.log('❌ Client not found.')
          }
          break
        }
        case '0':
          console.log('👋 Goodbye!')
          rl.close()
          process.exit(0)
      }
    } catch (error) {
      await handleError(error)
    }
  }
}

main()
