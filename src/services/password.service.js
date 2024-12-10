import bcrypt from 'bcrypt'

const SALTOS = 10

export const encryptar =  async (password) => {
    return await bcrypt.hash(password, SALTOS);
}

export const compararEncrypt = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}