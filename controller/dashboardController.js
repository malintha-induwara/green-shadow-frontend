import { getAllStaff } from "../model/staffModel.js";
import { getAllVehicles } from "../model/vehicleModel.js";
import { getAllFields } from "../model/fieldModel.js";
import { getAllCrops } from "../model/cropModel.js";

let staff = [];
let vehicles = [];
let fields = [];
let crops = [];

function updateStats() {
  const staffCount = staff.length;
  const vehicleCount = vehicles.length;
  const fieldCount = fields.length;
  const cropCount = crops.length;

  document.getElementById("totalStaff").textContent = staffCount;
  document.getElementById("totalVehicles").textContent = vehicleCount;
  document.getElementById("totalFields").textContent = fieldCount;
  document.getElementById("totalCrops").textContent = cropCount;
}

function initializeCharts() {
  Chart.defaults.font.size = 12;
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;

  // Resources Overview Chart
  new Chart(document.getElementById('resourcesChart'), {
    type: 'bar',
    data: {
      labels: ['Staff', 'Vehicles', 'Fields', 'Crops'],
      datasets: [{
        label: 'Total Count',
        data: [staff.length, vehicles.length, fields.length, crops.length],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    }
  });

  // Staff Roles Distribution
  const roleCount = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});

  new Chart(document.getElementById('staffRolesChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(roleCount),
      datasets: [{
        data: Object.values(roleCount),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 10,
            font: {
              size: 11
            }
          }
        }
      }
    }
  });

  // Vehicle Status Distribution
  const vehicleStatus = vehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  new Chart(document.getElementById('vehicleStatusChart'), {
    type: 'pie',
    data: {
      labels: Object.keys(vehicleStatus),
      datasets: [{
        data: Object.values(vehicleStatus),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 10,
            font: {
              size: 11
            }
          }
        }
      }
    }
  });

  // Field Size Distribution
  new Chart(document.getElementById('fieldSizeChart'), {
    type: 'line',
    data: {
      labels: fields.map(f => f.fieldName),
      datasets: [{
        label: 'Field Size',
        data: fields.map(f => f.extentSize),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            },
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  //Load Data
  staff = await getAllStaff();
  vehicles = await getAllVehicles();
  fields = await getAllFields();
  crops = await getAllCrops();

  updateStats();
  initializeCharts();
});
