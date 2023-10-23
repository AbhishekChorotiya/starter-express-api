const jwt = require('jsonwebtoken')
const User = require('../models/faculty')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        console.log(token)
        const decoded = jwt.verify(token, 'LMS')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth