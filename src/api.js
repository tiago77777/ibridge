import axios from "axios"
import {ENV} from "./constants"

class API {
	constructor() {
		this.http = axios.create({
    baseURL: ENV == "development" ? "http://localhost:3000" : "/api/"
  })
	}
	async getClients() {
		try {
			let {data} = await this.http.get('/getClients')
			console.log('API.getClients',{data})
			return data;
		} catch (err) {
			console.error("Failed to getClients",err);
			return {status:"ERR",message:"Failed to get clients"};
		}
	}
	async getStats() {
		try {
			let {data,response} = await this.http.get('/getStats')
			console.log('API.getStats',{data})
			return data;
		} catch (err) {
			console.error("Failed to getStats",err);
			return {status:"ERR",message:"Failed to get stats"};
		}
	}
	async getClientsByDate(date) {
	 try {
			let {data,response} = await this.http.get(`/getClientsByDate/${date}`)
			console.log('API.getClientsByDate',{data})
			return data;
		} catch (err) {
			console.error("Failed to getClientsByDate",err);
			return {status:"ERR", message:"Failed to get client by date"};
		}
	}
	async getStatsByDate(date) {
		try {
			let {data,response} = await this.http.get(`/getStatsByDate/${date}`)
			console.log('API.getStatsByDate',{data})
			return data;
		} catch (err) {
			console.error("Failed to getStatsByDate",err);
			return {status:"ERR",message:"Failed to get stats by date"};
		}
	}
}

const api = new API();

export default api
