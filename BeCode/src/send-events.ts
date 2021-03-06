import { messages } from './messages'
import axios from 'axios'

async function main() {
    messages.forEach(async message => {
        let endpoint = 'shipment'
        if (message.type === 'ORGANIZATION') {
            endpoint = 'organization'
        }

        try {
            let axiosResp = await axios.post(`http://localhost:3405/${endpoint}`, message)
            console.log("Post: ")
            console.log(axiosResp.data);
        } catch (error) {
            console.error(error.code)
        }
    })
    try {
        let shipMsg = await axios.get('http://localhost:3405/shipments/S00001167')
        console.log("Get Shipment: ")
        console.log(shipMsg.data)
    } catch (error) {
        console.error(error.code)
    }
    try {
        let orgMsg = await axios.get('http://localhost:3405/organizations/34f195b5-2aa1-4914-85ab-f8849f9b541a')
        console.log("Get Organization: ")
        console.log(orgMsg.data)
    } catch (error) {
        console.error(error.code)
    }
    try {
        let unitMsg = await axios.get('http://localhost:3405/shipments/POUNDS')
        console.log("Get Units: ")
        console.log(unitMsg.data)
    } catch (error) {
        console.error(error.code)
    }
}

main()