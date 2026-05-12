module.exports = {
  async up(db) {
    const coll = db.collection('service_order');
    const legacyFilter = {
      client: { $exists: false },
      clientId: { $exists: true, $ne: null },
      clientDocument: { $exists: true, $ne: null },
      clientName: { $exists: true, $ne: null },
      vehicleId: { $exists: true, $ne: null },
      vehiclePlate: { $exists: true, $ne: null },
      vehicleBrand: { $exists: true, $ne: null },
      vehicleModel: { $exists: true, $ne: null },
      vehicleYear: { $exists: true, $ne: null },
    };
    const cursor = coll.find(legacyFilter);
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      await coll.updateOne(
        { _id: doc._id },
        {
          $set: {
            client: {
              id: doc.clientId,
              document: doc.clientDocument,
              name: doc.clientName,
            },
            vehicle: {
              id: doc.vehicleId,
              plate: doc.vehiclePlate,
              brand: doc.vehicleBrand,
              model: doc.vehicleModel,
              year: doc.vehicleYear,
            },
          },
          $unset: {
            clientId: '',
            clientDocument: '',
            clientName: '',
            vehicleId: '',
            vehiclePlate: '',
            vehicleBrand: '',
            vehicleModel: '',
            vehicleYear: '',
          },
        },
      );
    }
  },

  async down(db) {
    const coll = db.collection('service_order');
    const nestedFilter = {
      client: { $exists: true },
      clientDocument: { $exists: false },
    };
    const cursor = coll.find(nestedFilter);
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const { client, vehicle } = doc;
      if (!client || !vehicle) continue;
      await coll.updateOne(
        { _id: doc._id },
        {
          $set: {
            clientId: client.id,
            clientDocument: client.document,
            clientName: client.name,
            vehicleId: vehicle.id,
            vehiclePlate: vehicle.plate,
            vehicleBrand: vehicle.brand,
            vehicleModel: vehicle.model,
            vehicleYear: vehicle.year,
          },
          $unset: {
            client: '',
            vehicle: '',
          },
        },
      );
    }
  },
};
