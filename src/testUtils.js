const { profileBuilder } = require("./factories/profile.factory");
const { Profile, Contract, Job } = require("./repos/model");

async function getTestProfiles() {
  await Profile.sync({ force: true });
  await Contract.sync({ force: true });
  await Job.sync({ force: true });

  const [clientProfile, contractorProfile1, contractorProfile2] =
    await Promise.all([
      Profile.create(
        profileBuilder({
          type: Profile.CLIENT_TYPE,
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
};
