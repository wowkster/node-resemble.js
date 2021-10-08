var resemble = require('../resemble.js');

(async () => {
    const data = await resemble('People.png').async()
    console.log(data)

    const diff = await resemble('People.png').compareTo('People2.png').async()
    console.log(diff)
})()
