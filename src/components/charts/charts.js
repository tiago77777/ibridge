import React,{ useEffect } from "react"
import Chart from "chart.js/auto"
import "./charts.less"
import state from "./../../state/state.global.js"

export const DailyCallsChart = () => {
  const id = Math.random();
  const data = state.getDailyCalls();
  
  useEffect(() => {
    const ctx = document.getElementById(id);
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
              label: 'Chamadas por dia',
              data: data.data,
          }],
        },
    });
    return () => {
      myChart.destroy();
    }
  })
  return (
    <div className="DailyCallsChart chart" style={{width: "33%"}}>
      <canvas id={id} className="canvas" width="100%"></canvas>
    </div>
  )
}

export const OcurrenciesChart = () => {
    const id = Math.random() + 2;
    let data = state.getOcurrencies();
    useEffect(() => {
      const ctx = document.getElementById(id);
      const myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: data.labels,
              datasets: [{
                  label: 'Test',
                  data: data.data,
                  backgroundColor: ['red','green','blue','yellow','pink'],
                  borderColor: [
                      'rgba(0,0,0, .5)',
                  ],
              }]
          },
          options: {
              responsive: true,
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
      return () => {
        myChart.destroy();
      }
  })
  
  return (
     <div className="OcurrenciesChart chart" style={{width: '33%'}}>
      <canvas id={id} width="100%"></canvas>
     </div>
  )
}
export const ClassificationsChart = () => {
    const id = Math.random() + 2;
    const data = state.getClassificationsData();
    console.log('data',JSON.stringify(data))
    useEffect(() => {
      const ctx = document.getElementById(id);
      const myChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: data.labels,
              datasets: [{
                  label: 'Classificação',
                  data: data.data,
                  backgroundColor: ['red','blue','yellow','green','purple','orange','black','pink'],
              }]
          },
          options: {
              responsive: true,
          }
      });
      return () => {
        myChart.destroy();
      }
  })
  
  return (
     <div className="ClassificationsChart chart" style={{width: '33%'}}>
      <canvas id={id} width="100%"></canvas>
     </div>
  )
}