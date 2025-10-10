<script>
  export let vehicleData = {};
</script>

<div class="space-y-4 text-sm">
  <!-- 🛰️ GPS & Telemetry -->
  <section>
    <h3 class="font-semibold text-gray-700 border-b pb-1 mb-1">GPS & Telemetry</h3>
    <div>Latitude: {vehicleData?.latitude ?? '-'}</div>
    <div>Longitude: {vehicleData?.longitude ?? '-'}</div>
    <div>Speed: {vehicleData?.speed ?? '-'} km/h</div>
    <div>Heading: {vehicleData?.heading ?? '-'}°</div>
    <div>Altitude: {vehicleData?.altitude ?? '-'} m</div>
    <div>Satellites: {vehicleData?.satellites ?? '-'}</div>
    <div>HDOP: {vehicleData?.hdop ?? '-'}</div>
  </section>

  <!-- ⚠️ Alerts & Summary -->
  <section>
    <h3 class="font-semibold text-gray-700 border-b pb-1 mb-1">Alerts & Summary</h3>
    <div>Overspeed: {vehicleData?.alarms?.overspeed ? 'Yes' : 'No'}</div>
    <div>Fatigue: {vehicleData?.alarms?.fatigue ? 'Yes' : 'No'}</div>
    <div>Collision: {vehicleData?.alarms?.collision ? 'Yes' : 'No'}</div>
    <div>GPS Time: {vehicleData?.gpsTime ?? '-'}</div>
    <div>Proc Time: {vehicleData?.proctime ?? '-'}</div>
  </section>

  <!-- ⚙️ I/O & Sensors -->
  <section>
    <h3 class="font-semibold text-gray-700 border-b pb-1 mb-1">I/O & Sensors</h3>
    <div>ACC: {vehicleData?.acc ?? '-'}</div>
    <div>Ignition: {vehicleData?.ignition ?? '-'}</div>
    <div>Battery Voltage: {vehicleData?.batteryVoltage ?? '-'}</div>
    <div>External Power: {vehicleData?.externalPower ?? '-'}</div>
    <div>Temperature: {vehicleData?.temperature?.join(', ') ?? '-'}</div>
    <div>Humidity: {vehicleData?.humidity?.join(', ') ?? '-'}</div>
  </section>

  <!-- 💾 Storage Info -->
  <section>
    <h3 class="font-semibold text-gray-700 border-b pb-1 mb-1">Storage Info</h3>
    <div>
      SD: {vehicleData?.disk?.sd?.freeMB ?? '-'} / {vehicleData?.disk?.sd?.totalMB ?? '-'} MB
    </div>
    <div>
      SSD: {vehicleData?.disk?.ssd?.freeMB ?? '-'} / {vehicleData?.disk?.ssd?.totalMB ?? '-'} MB
    </div>
  </section>
</div>
