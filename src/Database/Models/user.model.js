import mongoose from "mongoose";
import * as Type from "../../utils/types.js";
import bcrypt from "bcrypt";
import { decrypt, encrypt } from "../../utils/CryptoJS/cryptoJs.js";
import { hash } from "../../utils/Bcrypt/bcrypt.js";

// Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
      minLength: 2,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
      minLength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === Type.providerTypes.system ? true : false;
      },
      minLength: 6,
    },
    gender: {
      type: String,
      required: true,
      default: Type.genderTypes.male,
      enum: Object.values(Type.genderTypes),
    },
    role: {
      type: String,
      required: true,
      default: Type.roleTypes.user,
      enum: Object.values(Type.roleTypes),
    },
    provider: {
      type: String,
      required: true,
      default: Type.providerTypes.system,
      enum: Object.values(Type.providerTypes),
    },
    mobileNumber: {
      type: String,
      required: function () {
        return this.provider === Type.providerTypes.system ? true : false;
      },
      trim: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    OTP: [
      {
        code: String,
        OTPType: {
          type: String,
          enum: Object.values(Type.OTPTypes),
        },
        expiresIn: Date,
      },
    ],
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    DOB: Date,
    deletedAt: Date,
    bannedAt: Date,
    changeCredentialTime: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field
userSchema
  .virtual("userName")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (v) {
    const firstName = v.substring(0, v.indexOf(" "));
    const lastName = v.substring(v.indexOf(" ") + 1);
    this.set({ firstName, lastName });
  });

// Sensitive data hiding
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await hash(this.password);
    }
    if (this.isModified("mobileNumber")) {
      this.mobileNumber = encrypt(
        this.mobileNumber,
        process.env.MOBILE_NUMBER_KEY
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});
// Mobile decoded
userSchema.post(["findOne", "find"], function (docs) {
  if (!docs) return;

  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      if (doc.mobileNumber) {
        doc.mobileNumber = decrypt(
          doc.mobileNumber,
          process.env.MOBILE_NUMBER_KEY
        );
      }
    });
  } else if (docs.mobileNumber) {
    docs.mobileNumber = decrypt(
      docs.mobileNumber,
      process.env.MOBILE_NUMBER_KEY
    );
  }
});

// Delete related docs
userSchema.pre("deleteOne", { document: true }, async function (next) {
  const userId = this._id;

  await companyModel.deleteMany({ createdBy: userId });
  await jobOpportunityModel.deleteMany({ addedBy: userId });
  await applicationModel.deleteMany({ userId });

  next();
});

userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getQuery());
  if (user) {
    await companyModel.deleteMany({ createdBy: user._id });
    await jobOpportunityModel.deleteMany({ addedBy: user._id });
    await applicationModel.deleteMany({ userId: user._id });
  }
  next();
});

// Model

const userModel = mongoose.model("User", userSchema);

export default userModel;
