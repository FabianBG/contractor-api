const faker = require("faker");

function jobBuilder(custom) {
  return {
    description: faker.lorem.paragraph(),
    price: faker.lorem.paragraph(),
    paid: false,
    paymentDate: new Date().toISOString(),
    ContractId: faker.datatype.number(),
    ...custom,
  };
}

module.exports = {
  jobBuilder,
};
