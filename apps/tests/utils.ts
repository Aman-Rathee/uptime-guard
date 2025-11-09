import axios from "axios"
import { backend_url } from "./config"

export const createUser = async () => {

    const email = `aman${Date.now()}@gmail.com`
    const res = await axios.post(`${backend_url}/auth/signup`, {
        email,
        password: "my_password"
    })

    const token = res.data.token
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = atob(payloadBase64);
    const payload = JSON.parse(decodedPayload);

    return {
        id: payload.userid,
        token
    }
}