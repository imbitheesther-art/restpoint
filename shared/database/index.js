// Shared database module
const database = {
  connect: async () => {
    console.log('Database connected successfully');
  },
  query: async (sql, params) => {
    console.log('Query executed:', sql);
    return [];
  }
};

module.exports = database;
