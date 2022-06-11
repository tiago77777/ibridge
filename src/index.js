import "@babel/polyfill"
import React,{useEffect,useState} from 'react'
import './index.less'
import * as ReactDOM from "react-dom/client"
import { observer } from "mobx-react"
import { action } from "mobx"
import {
 DailyCallsChart, 
 OcurrenciesChart, 
 ClassificationsChart
} from "./components/charts/charts.js"
import state from "./state/state.global.js"
import {SmallLoading} from "./components/loading/loading.js"
import {ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

const App = observer(() => {
    let [dateMessage, setDateMessage] = useState("");
    const changeClient = action((event) => {
      state.getClientsByDate(state.currentDate);
    });
    const handleDateChange = action((event) => {
      let date = event.currentTarget.value;
      if (state.availableDates.includes(date)) {
        state.currentDate = date;
        state.selectStat(date);
        setDateMessage("")
      } else {
        setDateMessage("Data não disponível")
      }
    })
    const filterClient = (event) => {
     let client = event.target.value;
     state.setCurrentClient(client)
    }
    useEffect(() => {
      state.getStats();
      return () => {}
    }, [])
    return (
        <div className="App">
            <ToastContainer/>
            <div className="filters">
              {
                !state.fetchingStats ? [
                  <select value={state.currentClient} key="select-client" onChange={filterClient}>
                    {
                      [
                       <option value="" selected>Cliente</option>,
                       state.clientsToSelect.map((client,key) => {
                         return (
                           <option key={client} value={client}>{client}</option>
                         ) 
                       })
                      ]
                    }
                  </select>,
                  <input key="date-input" onChange={handleDateChange} className="date" type="date" value={state.currentDate}/>,
                  <p key="date-message">{dateMessage}</p>
                ] : <SmallLoading/>
              }
            </div>
            <div className="stats">
              <DailyCallsChart/>
              <ClassificationsChart/>
              <OcurrenciesChart/>
            </div>
            {
             state.fetchingClients === true ? (
              <SmallLoading/>
             ) : state.clients.length < 1 ? ( 
              <h1 className="noData">Selecione uma data disponível</h1>
             ) : (
              <div className="client">
                <table>
                  <thead>
                    <tr>
                      <th>id</th>
                      <th>Chamadas total</th>
                      <th>Chamadas atendidas</th>
                      <th>Ocorrências totais</th>
                      <th>Ocorrências com contato</th>
                    </tr>
                  </thead>
                  <tbody>
                    { 
                     !!state.clients ? (
                        state.clients.map(client => {
                           if (client.id !== state.currentClient && state.currentClient != '')
                            return null;
                           return (
                             <tr key={`${client.id}+${Math.random()}`}>
                               <td>{client.id}</td>
                               <td>{client.chamadas_total}</td>
                               <td>{client.chamadas_atendimento_humano}</td>
                               <td>{client.ocorrencias_total}</td>
                               <td>{client.ocorrencias_com_contato}</td>
                             </tr>
                           )
                        })
                     ) : <h1>Nada para mostrar</h1>
                    }
                  </tbody>
                </table>
              </div>
             )
            }
        </div>
    );
});

const root = ReactDOM.createRoot(document.querySelector(".root"))
root.render(<App/>)
