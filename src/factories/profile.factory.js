const faker = require("faker");

function profileBuilder(custom) {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    profession: faker.commerce.department(),
    balance: Number(faker.finance.amount()),
    type: "client",
    ...custom,
  };
}

module.exports = {
  profileBuilder,
};
