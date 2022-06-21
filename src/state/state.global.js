import {makeAutoObservable, action, observable} from "mobx"
import api from "./../api.js"
import {toast} from "react-toastify"

class State {
	@observable fetchingClients = false;
	@observable fetchingStats = false;
	@observable stats = [];
	@observable currentStat = undefined;
	@observable currentDate = '';
	@observable availableDates = []
 @observable clientsToSelect = [];
 clients = observable.array([], {deep:true});
	tableClients = observable.array([],{deep:true});
	@observable currentClient = '';

	constructor() {
		makeAutoObservable(this)
	}
	getClassificationsData() {
	 if (!this.currentStat) 
	  return { labels:[], data: [] };
	 return {
	  labels: [
	   'Falha operadora',
	   'Telefone incorreto',
	   'Nao atendida',
	   'Atendimento máquina',
	   'Atendimento humano',
	   'Abandono pre fila',
	   'Abandono fila',
	   'Atendimento PA?',
	  ],
	  data: [
 	  this.currentStat.chamadas_falha_operadora,
 	  this.currentStat.chamadas_telefone_incorreto,
 	  this.currentStat.chamadas_nao_atendida,
 	  this.currentStat.chamadas_atendimento_maquina,
 	  this.currentStat.chamadas_atendimento_humano,
 	  this.currentStat.chamadas_abandono_pre_fila,
 	  this.currentStat.chamadas_abandono_fila,
 	  this.currentStat.chamadas_atendimento_pa,
	  ]
	 }
	}
	getOcurrencies() {
	 if (!this.currentStat) return {labels:[], data:[]};
	 return {
	  labels: [
	   'Total',
	   'Sem contato',
	   'Com contato',
	   'Abordagem',
	   'Fechamento'
	  ],
	  data: [
  	 this.currentStat.ocorrencias_total,
  		this.currentStat.ocorrencias_sem_contato,
  		this.currentStat.ocorrencias_com_contato,
  		this.currentStat.ocorrencias_abordagem,
  		this.currentStat.ocorrencias_fechamento
	  ]
	 }
	}
	getDailyCalls() {
	 let stats = {labels:[],data:[]};
	 let data = [];
	 let startDate = (new Date(state.currentDate)).getTime();
	 stats.data = this.stats.map(stat => {
	  let dateStr = stat.data.split(' ')[0];
	  let date = new Date(dateStr).getTime();
	  if (date < startDate)
	   return null;
   stats.labels.push(dateStr)
   return stat.chamadas_total;
  })
  return stats;
	}
	@action
	setCurrentClient(client) {
	 this.currentClient = client;
	}
	@action
	getStats() {
		this.fetchingStats = true;
		api.getStats().then(action((res) => {
			if (res.status === "ERR") {
				return toast.error(res.message);
			}
			this.stats = res.data;
			this.availableDates = res.data.map(stat => {
				return stat.data.split(' ')[0];
			})
			this.fetchingStats = false;
		}));
	}
	@action
	getClientsByDate(date) {
	 this.fetchingClients = true;
	 api.getClientsByDate(date).then(action(res => {
	  if (res.status === "ERR") {
	   return toast.error(err.message);
	  }
	  this.clients = res.data;
	  this.fetchingClients = false;
	 }))
	}
	@action
	selectStat(date) {
	 this.getClientsByDate(date);
		let stat = this.stats.find(stat => {
			let d = stat.data.split(' ')[0]
			return d === date;
		})
		this.currentStat = stat;
		this.clientsToSelect = stat.clientes.split(',');
	}
}

const state = new State();

export default state;