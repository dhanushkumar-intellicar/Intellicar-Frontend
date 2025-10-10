<script>
  export let vehicleData = {};
</script>

<div class="space-y-1 text-sm">
  <h3 class="font-semibold text-gray-700 border-b pb-1 mb-1">Device Overview</h3>
  <div>IMEI: {vehicleData?.imei ?? '-'}</div>
  <div>Model: {vehicleData?.model ?? '-'}</div>
  <div>Firmware: {vehicleData?.firmware ?? '-'}</div>
  <div>Network: {vehicleData?.network ?? '-'}</div>
  <div>Online: {vehicleData?.online ? 'Yes' : 'No'}</div>
</div>
