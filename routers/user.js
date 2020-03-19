const express = require('express');
const multer = require('multer');
const User = require('../src/model/user');
const auth = require('../src/middleware/auth');

const route = new express.Router();
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return cb(new Error("Please upload image file"));
        }
        cb(undefined, true);
    }
});

route.post('/user', async (req, res) => {
    const userdata = new User(req.body);
    try {
        await userdata.save();
        const token = await userdata.generateAuthToken();
        res.send({userdata, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

route.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        console.log(user);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

route.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

route.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch(e) {
        res.status(500).send();
    }
});

route.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

route.patch('/user/update', auth, async (req, res) => {
    try {
        Object.keys(req.body).forEach((update) => {
            req.user[update] = req.body[update];
        });

        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

route.delete('/user/delete', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id);
        // if(!user) {
        //     return res.send(404).send({});
        // }
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e)
    }
});

route.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send();
});

route.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

route.get('/user/:id/avatar', auth, async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user._id});
        if(!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-type', 'image/jpeg');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = route;