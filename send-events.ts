import { messages } from './messages'
import axios from 'axios'

async function main() {
    messages.forEach(async message => {
        let endpoint = 'shipment'
        if (message.type === 'ORGANIZATION') {
            endpoint = 'organization'
        }

        try {
            await axios.post(`http://localhost:3000/${endpoint}`, message)
        } catch (error) {
            console.error(error.code)
        }

    })
}

main()