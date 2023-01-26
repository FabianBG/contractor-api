/**
 * Will parse a request headers
 * @returns None
 */
const parseHeaders = async (req, res, next) => {
  const { headers } = req;

  req.profileId = headers["profile-id"];

  next();
};
module.exports = { parseHeaders };
