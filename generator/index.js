const fs = require('fs')
const path = require('path')

const contentDir = path.join(__dirname, '..', 'content')

const courses = fs.readdirSync(contentDir)
console.log(courses)
courses.forEach((course) => {
    const configFilePath = path.join(contentDir, course, 'config.json')
    let data = {}
    if(fs.existsSync(configFilePath)){
        data = fs.readFileSync(configFilePath)
    }
    const config = Object.assign({
        displayname: course.charAt(0).toUpperCase() + course.slice(1),
        customurl: course
    }, data)

    
})