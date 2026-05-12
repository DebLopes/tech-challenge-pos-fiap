const SERVICES = [
  {
    _id: '55555555-5555-4555-8555-555555555501',
    name: 'Troca de óleo (demo — 1 peça)',
    description: 'Usa apenas DEMO-OIL-01',
    basePrice: 120,
    active: true,
    defaultParts: [{ productCode: 'DEMO-OIL-01', quantity: 1 }],
  },
  {
    _id: '55555555-5555-4555-8555-555555555502',
    name: 'Diagnóstico rápido (demo — sem peças)',
    description: 'Somente mão de obra; sem peças padrão',
    basePrice: 80,
    active: true,
    defaultParts: [],
  },
  {
    _id: '55555555-5555-4555-8555-555555555503',
    name: 'Revisão combo (demo — 2 peças)',
    description: 'Óleo + filtro (DEMO-OIL-01 e DEMO-FILTER-01)',
    basePrice: 199.9,
    active: true,
    defaultParts: [
      { productCode: 'DEMO-OIL-01', quantity: 1 },
      { productCode: 'DEMO-FILTER-01', quantity: 1 },
    ],
  },
];

module.exports = {
  async up(db) {
    const now = new Date();
    for (const s of SERVICES) {
      await db.collection('catalog_service').replaceOne(
        { _id: s._id },
        {
          ...s,
          createdAt: now,
          updatedAt: now,
        },
        { upsert: true },
      );
    }
  },

  async down(db) {
    await db.collection('catalog_service').deleteMany({
      _id: { $in: SERVICES.map((s) => s._id) },
    });
  },
};
