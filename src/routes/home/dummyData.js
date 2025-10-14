// dummyData.js
export const dummyVehicle = {
  deviceid: "VEH001",
  imei: "863456789012345",
  simno: "89914509006774295298",
  model: "ULV-GPS-TX",
  firmware: "v2.0.0",
  network: "4G",
  online: true,
  latitude: 12.9715987,
  longitude: 77.5945627,
  gpsTime: "2025-10-10 11:50:00",
  proctime: "2025-10-10 11:50:00",
  speed: 42.3,
  heading: 210,
  altitude: 910,
  satellites: 9,
  hdop: 0.8,
  mileage_km: 12054.7,
  fuel_l: 45.3,
  fuel_percent: 78,
  acc: "ON",
  ignition: "ON",
  door1: "Closed",
  door2: "Closed",
  batteryVoltage: "12.6V",
  externalPower: "13.8V",
  gsmSignal: 85,
  temperature: [23.4, 24.1, 22.8, 25.0],
  humidity: [65, 64, 67, 66],
  ioStatusBits: [1,0,1,0,0,1,0,1],
  videoStatus: {
    recording: [true,true,false,true],
    loss: [false,false,true,false]
  },
  disk: {
    sd: { totalMB: 32000, freeMB: 28000 },
    ssd: { totalMB: 128000, freeMB: 94000 }
  },
  driver: {
    name: "John Doe",
    license: "DL4ABC202511",
    status: "On Duty",
    drivingTimeMin: 252
  },
  company: "Intellicar Technologies Pvt Ltd",
  plate: "KA05MJ1234",
  assemblyDate: "2025-01-12",
  alarms: {
    overspeed: false,
    fatigue: false,
    collision: false
  }
};
