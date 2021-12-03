import React from "react";
import { Bar } from "react-chartjs-2";

class BarChart extends React.Component {
  render() {
    const { data, highlight } = this.props;
    const barData = {
      labels: data.map((val, i) => i),
      datasets: [
        {
          backgroundColor: data.map((val, i) =>
            i >= highlight[0] && i <= highlight[1] ? "rgba(135, 206, 235, 1)" : "rgba(255, 99, 132, 0.2)"
          ),
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          data: data
        }
      ]
    };
    const options = {
      responsive: true,
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            display: false
          }
        ],
        yAxes: [
          {
            display: false,
            ticks: {
              min: 0
            }
          }
        ]
      }
    };
    return <Bar data={barData} options={options} />;
  }
}

export default BarChart;
