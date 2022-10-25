const fs = require('fs')
const path = require('path')
const markdownIt = require('markdown-it')

const md = new markdownIt()

const startDate = Date.now()
console.log("[Build] Started")

const projectRootDir = path.join(__dirname, '..')
const contentDir = path.join(projectRootDir, 'content')

const courses = fs.readdirSync(contentDir)

for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    
    const configFilePath = path.join(contentDir, course, 'config.json')
    let data = {}
    if(fs.existsSync(configFilePath)){
        data = JSON.parse(fs.readFileSync(configFilePath))
    }
    const config = Object.assign({
        displayname: course.charAt(0).toUpperCase() + course.slice(1),
        customurl: course
    }, data)

    courses[i] = {
        path: course,
        url: config.customurl,
        displayname: config.displayname
        //TODO color, cover
    }
}

let indexPage = fs.readFileSync(path.join(projectRootDir, 'template', 'index.html')).toString()
let inject = ""
courses.forEach(course => {
    inject += `<a href="/course/${course.url}">${course.displayname}</a>\n`
});
indexPage = indexPage.replace(/%CONTENT%/g, inject)
fs.writeFileSync(path.join(projectRootDir, 'docs', 'index.html'), indexPage)

let coursesPage = fs.readFileSync(path.join(projectRootDir, 'template', 'courses.html')).toString()
inject = ""
courses.forEach(course => {
    inject += `<a href="/course/${course.url}">${course.displayname}</a>\n`
});
coursesPage = coursesPage.replace(/%CONTENT%/g, inject)
fs.writeFileSync(path.join(projectRootDir, 'docs', 'courses.html'), coursesPage)

tryCreateDir(path.join(projectRootDir, 'docs', 'course'))
const coursePageTemplate = fs.readFileSync(path.join(projectRootDir, 'template', 'course.html')).toString()
courses.forEach(course => {
    tryCreateDir(path.join(projectRootDir, 'docs', 'course', course.url))
    let courseStructure = {}
    [
        {
            files: [],
            directories: [
                {
                    files: [],
                    directories: []
                }
            ]
        }
    ]

    function generateDir(p, out) {
        let toreturn = {
            files: [],
            directories: []
        }
        tryCreateDir(out)
        const files = fs.readdirSync(p)
        const stats = files.map(name => fs.statSync(path.join(p, name)))
        for (let i = 0; i < stats.length; i++) {
            if(files[i] == "config.json") { continue }

            const stat = stats[i];
            
            if(stat.isDirectory()){
                toreturn.directories.push(generateDir(path.join(p, files[i]), path.join(out, files[i])))
                continue
            }

            const extension = files[i].split('.').pop()

            if(extension == 'md'){
                const markdown = fs.readFileSync(path.join(p, files[i])).toString()
                fs.writeFileSync(path.join(out, files[i].replace(/\.[^/.]+$/, ".html")), //regex removes file extension
                    coursePageTemplate.replace(/%CONTENT%/g, md.render(markdown)))
                toreturn.files.push(files[i]) //TODO change to some sort of title/display name
            }else{
                throw new Error(`Unsupported file type at ${path.join(p, files[i])}: ${extension}`)
            }

        }
        return toreturn
    }

    const coursePath = path.join(projectRootDir, 'content', course.path)
    const courseOutPath = path.join(projectRootDir, 'docs', 'course', course.url)
    console.log(generateDir(coursePath, courseOutPath))

    let coursePage = fs.readFileSync(path.join(projectRootDir, 'template', 'course.html')).toString()
    inject = ""
    inject += `TODO`
    coursePage = coursePage.replace(/%CONTENT%/g, inject).replace(/%NAME%/g, course.displayname)
    
    fs.writeFileSync(path.join(projectRootDir, 'docs', 'course', `${course.url}.html`), coursePage)
});



// docs/index.html                     --> /
// docs/courses.html                   --> /courses
// docs/course/phisics.html            --> /course/phisics
// docs/course/phisics/gravity.html    --> /course/phisics/gravity

console.log("[Build] Finished in " + (Date.now() - startDate) + 'ms')

function tryCreateDir(p) {
    if(!fs.existsSync(p)) {
        fs.mkdirSync(p)
    }
}