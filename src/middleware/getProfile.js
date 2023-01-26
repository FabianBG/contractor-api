/**
 * Will get a user profile with the profile id set on the express context
 * @returns None
 */
const getProfile = async (req, res, next) => {
  const { Profile } = req.app.get("models");
  const profileId = req.profileId || 0;
  const profile = await Profile.findOne({
    where: { id: profileId },
  });

  if (!profile) return res.status(401).end();
  req.profile = profile;

  next();
};
module.exports = { getProfile };
