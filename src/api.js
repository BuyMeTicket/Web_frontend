import axios from "axios";
const formDataInstance = axios.create({
    baseURL: "https://web-buymeticket.vercel.app/api/",
    headers: {
        "Content-Type": "multipart/form-data"
    }
})

const instance = axios.create({
    baseURL: "https://web-buymeticket.vercel.app/api/",
    headers: {
        "Content-Type": "application/json"
    }
})
const backend_uri = axios.create({
    baseURL: "https://web-buymeticket.vercel.app/",
    headers: {
        "Content-Type": "application/json"
    }
})

export { formDataInstance, instance,backend_uri };