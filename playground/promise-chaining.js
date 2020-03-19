require('../src/db/mongoose');
const Task = require('../src/model/task');

Task.findByIdAndDelete('5e6636621360626224d77fe5').then((task) => {
    console.log(task);
    return Task.countDocuments({completed: false})
}).then((result) => {
    console.log(result);
});
// 5e667b6de27a236338b306c0
const deleteTaskAndCount = async (id) => {
    const tasks = await Task.findByIdAndDelete('5e667b6de27a236338b306c0');
    const count = await Task.countDocuments({completed: false});
    return {
        count,
        tasks
    };
};

deleteTaskAndCount().then((result) => {
    console.log(result);
}).catch((e) => {
    console.log(e);
});