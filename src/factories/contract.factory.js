const faker = require("faker");

function contractBuilder(custom) {
  return {
    terms: faker.lorem.paragraph(),
    status: "in_progress",
    ClientId: faker.datatype.number(),
    ContractorId: faker.datatype.number(),
    ...custom,
  };
}

module.exports = {
  contractBuilder,
};
