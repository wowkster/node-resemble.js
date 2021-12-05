const { src, task, watch } = require('gulp')
const jasmine = require('gulp-jasmine')
const { log, colors } = require('gulp-util')

const srcFiles = './dist/index.js'
const specFiles = './index.spec.js'

function runTests(breakOnError) {
    return src(specFiles)
        .pipe(
            jasmine({
                includeStackTrace: true,
            })
        )
        .on('error', errorHandler(breakOnError))
}

function errorHandler(breakOnError) {
    return function (error) {
        if (breakOnError) {
            throw error
        } else {
            log(colors.red('[Jasmine]'), error.toString())
            this.emit('end')
        }
    }
}

task('test', function () {
    return runTests(true)
})

task('test:auto', function () {
    runTests(false)

    return watch([srcFiles, specFiles], function () {
        runTests(false)
    })
})
