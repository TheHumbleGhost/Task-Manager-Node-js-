const express = require('express');
const Task = require('../src/model/task');
const auth = require('../src/middleware/auth');

const route = new express.Router();

route.post('/task', auth, async (req, res) => {
    // const taskInfo = new Task(req.body);
    const taskInfo = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await taskInfo.save();
        res.send(taskInfo);
    } catch (e) {
        res.status(400).send(e);
    }
});

route.get('/tasks', auth, async (req, res) => {
    const match = {};
    if(req.query.completed) {
        match.completed = req.query.completed === 'true';
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});

route.get('/task/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task) {
            res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

route.patch('/task/:id', auth, async (req, res) => {
    try {
        let task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task) {
            return res.status(404).send({})
        }
        Object.keys(req.body).forEach((update) => {
            task[update] = req.body[update];
        });
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

route.delete('/task/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id);
        let task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user.id});
        if(!task) {
            return res.status(404).send({});
        }
        res.send(task);
    } catch (e) {
        res.status(400).send(e)
    }
});

module.exports = route;