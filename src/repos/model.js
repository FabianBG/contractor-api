const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite3",
});

class Profile extends Sequelize.Model {
  static CLIENT_TYPE = "new";
  static CONTRACTOR_TYPE = "contractor";
}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2),
    },
    type: {
      type: Sequelize.ENUM(Profile.CLIENT_TYPE, Profile.CONTRACTOR_TYPE),
    },
  },
  {
    sequelize,
    modelName: "Profile",
  }
);

class Contract extends Sequelize.Model {
  static NEW_STATUS = "new";
  static IN_PROGRESS_STATUS = "in_progress";
  static TERMINATED_STATUS = "terminated";
}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM(
        Contract.NEW_STATUS,
        Contract.IN_PROGRESS_STATUS,
        Contract.TERMINATED_STATUS
      ),
    },
  },
  {
    sequelize,
    modelName: "Contract",
  }
);

class Job extends Sequelize.Model {}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: "Job",
  }
);

Profile.hasMany(Contract, { as: "Contractor", foreignKey: "ContractorId" });
Contract.belongsTo(Profile, { as: "Contractor" });
Profile.hasMany(Contract, { as: "Client", foreignKey: "ClientId" });
Contract.belongsTo(Profile, { as: "Client" });
Contract.hasMany(Job);
Job.belongsTo(Contract);

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
};
