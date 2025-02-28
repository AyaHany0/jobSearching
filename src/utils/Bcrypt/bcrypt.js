import bcrypt from "bcrypt";

export const hash = async (data, saltRounds = process.env.SALT_ROUNDS) => {
  return  await bcrypt.hashSync(data, Number(saltRounds));
};

export const compareHash =  async(data, hashedData) => {
  return  bcrypt.compareSync(data, hashedData);
};
