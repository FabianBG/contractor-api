const { profileBuilder } = require("./factories/profile.factory");
const { Profile, Contract, Job } = require("./repos/model");

async function initDB() {
  await Profile.sync();
  await Contract.sync();
  await Job.sync();
}

async function cleanDB() {
  await Profile.sync({ force: true });
  await Contract.sync({ force: true });
  await Job.sync({ force: true });
}

async function getTestProfiles() {
  try {
    Profile.create(
      profileBuilder({
        type: Profile.CLIENT_TYPE,
        balance: 1000,
      })
    );
  } catch (error) {
    console.error(error);
  }

  const [clientProfile, contractorProfile1, contractorProfile2] =
    await Promise.all([
      Profile.create(
        profileBuilder({
          type: Profile.CLIENT_TYPE,
          balance: 1000,
        })
      ),
      Profile.create(
        profileBuilder({
          type: Profile.CONTRACTOR_TYPE,
        })
      ),
      Profile.create(
        profileBuilder({
          type: Profile.CONTRACTOR_TYPE,
        })
      ),
    ]);

  return {
    clientProfile,
    contractorProfile1,
    contractorProfile2,
  };
}

module.exports = {
  getTestProfiles,
  initDB,
  cleanDB,
};
