import jwt from 'jsonwebtoken'

const JWT_SECRET=process.env.JWT_SECRET

export const generarJWT = (idUsuarios, correo_electronico) => {
    return jwt.sign({id: idUsuarios, email: correo_electronico}, JWT_SECRET, {expiresIn: "24h"})
}