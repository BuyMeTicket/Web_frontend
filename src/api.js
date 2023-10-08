import axios from "axios";
const formDataInstance = axios.create({
    baseURL: "http://localhost:5000/api/",
    headers: {
        "Content-Type": "multipart/form-data"
    }
})

const instance = axios.create({
    baseURL: "http://localhost:5000/api/",
    headers: {
        "Content-Type": "application/json"
    }
})


export { formDataInstance, instance };