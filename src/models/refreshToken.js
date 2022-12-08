const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const { Schema } = mongoose;

const RefreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expiryDate: Date
});

RefreshTokenSchema.statics.createToken = async function (user) {
  const expiredAt = new Date();

  console.log(Math.floor(Date.now() / 1000) + (60 * 60));
  console.log('TYPE', typeof (process.env.JWT_REFRESH_EXPIRATION));

  expiredAt.setSeconds(
    expiredAt.getSeconds() + Number(process.env.JWT_REFRESH_EXPIRATION)
  );

  const _token = uuidv4();

  const _object = new this({
    token: _token,
    user: user._id,
    expiryDate: expiredAt.getTime()
  });

  const refreshToken = await _object.save();

  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => token.expiryDate.getTime() < new Date().getTime();

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;
