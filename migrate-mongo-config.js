require('dotenv').config();

function resolveMongo(full) {
  const trimmed = full.trim();
  const withoutQuery = trimmed.split('?')[0];
  const m = withoutQuery.match(
    /^(mongodb(?:\+srv)?:\/\/[^/?]+)\/?([^/?]*)$/,
  );
  if (!m) {
    return {
      url: 'mongodb://localhost:27017',
      databaseName: 'techChallenge',
    };
  }
  const url = m[1];
  const databaseName = m[2] || 'techChallenge';
  return { url, databaseName };
}

const { url, databaseName } = resolveMongo(
  process.env.MONGO_URL || 'mongodb://localhost:27017/techChallenge',
);

module.exports = {
  mongodb: {
    url,
    databaseName,
    options: {},
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  lockCollectionName: 'changelog_lock',
  lockTtl: 0,
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};
