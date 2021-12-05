const resemble = require('../dist/index')

;(async () => {
    const data = await resemble('People.png').async()
    console.log(data)

    const diff = await resemble.compareImg('People.png', 'People2.png')

    console.log(diff)
})()
