import jwt from 'jsonwebtoken'

const JWT_SECRET=process.env.JWT_SECRET

export const generarJWT = (idUsuarios, correo_electronico) => {
    try{
        return jwt.sign({id: idUsuarios, email: correo_electronico}, JWT_SECRET, {expiresIn: "24h"})
    }catch(error){
        throw new Error(error.message)
    } 
}