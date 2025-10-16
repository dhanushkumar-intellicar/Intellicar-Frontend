<script>
  export let vehicleData = {};
</script>

<div class="space-y-2 text-sm">
  <section>
    <h3 class="font-semibold text-gray-700 border-b pb-1 mb-1">Driver Info</h3>
    <div>Name: {vehicleData?.driver?.name ?? '-'}</div>
    <div>License: {vehicleData?.driver?.license ?? '-'}</div>
    <div>Status: {vehicleData?.driver?.status ?? '-'}</div>
    <div>Driving Time: {vehicleData?.driver?.drivingTimeMin ?? '-'} min</div>
  </section>

  <section>
    <h3 class="font-semibold text-gray-700 border-b pb-1 mb-1">Vehicle Info</h3>
    <div>Plate: {vehicleData?.plate ?? '-'}</div>
    <div>Company: {vehicleData?.company ?? '-'}</div>
    <div>Assembly Date: {vehicleData?.assemblyDate ?? '-'}</div>
  </section>
</div>
